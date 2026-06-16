package com.example.bookland_be.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.HexFormat;
import java.util.List;
import java.util.concurrent.Semaphore;
import java.util.concurrent.TimeUnit;

/**
 * AiProviderService — Quản lý đa nhà cung cấp AI với:
 *   - Fallback tự động: Cerebras → Groq → DeepSeek → Gemini
 *   - Redis cache (10 phút) cho câu hỏi giống nhau
 *   - Rate limit tracking per provider (Redis counter / phút)
 *   - Concurrency guard (max 2 request song song) để tránh Cloudflare block
 *
 * Được inject vào GeminiService — không ảnh hưởng bất kỳ service nào khác.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AiProviderService {

    private final RedisTemplate<Object, Object> redisTemplate;
    private final ObjectMapper objectMapper;

    /** Tối đa 2 request AI song song — ngăn burst gây block IP */
    private final Semaphore concurrencyGuard = new Semaphore(2, true);

    // ── Provider API keys (optional — bỏ trống = skip provider đó) ─────────
    @Value("${ai.cerebras.api.key:}")
    private String cerebrasKey;

    @Value("${ai.groq.api.key:}")
    private String groqKey;

    @Value("${ai.deepseek.api.key:}")
    private String deepseekKey;

    @Value("${gemini.api.key:}")
    private String geminiKey;

    @Value("${gemini.api.url:https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent}")
    private String geminiUrl;

    private static final String CACHE_PREFIX    = "chatbot:ai:cache:";
    private static final String RL_PREFIX       = "chatbot:ai:rl:";
    private static final int    CACHE_TTL_MIN   = 10;   // phút

    // ── Provider definition (immutable record) ──────────────────────────────

    private record Provider(
            String name,
            String url,
            String apiKey,
            int    requestsPerMinute,
            boolean openAiCompat,
            String model
    ) {
        boolean available() { return apiKey != null && !apiKey.isBlank(); }
    }

    /** Danh sách provider theo thứ tự ưu tiên (nhanh/miễn phí trước) */
    private List<Provider> buildProviders() {
        List<Provider> list = new ArrayList<>();
        list.add(new Provider("cerebras",
                "https://api.cerebras.ai/v1/chat/completions",
                cerebrasKey, 30, true, "llama-3.3-70b"));
        list.add(new Provider("groq",
                "https://api.groq.com/openai/v1/chat/completions",
                groqKey, 30, true, "llama-3.3-70b-versatile"));
        list.add(new Provider("deepseek",
                "https://api.deepseek.com/chat/completions",
                deepseekKey, 60, true, "deepseek-chat"));
        list.add(new Provider("gemini",
                geminiUrl, geminiKey, 15, false, "gemini-2.0-flash"));
        return list.stream().filter(Provider::available).toList();
    }

    // ── Main entry point ────────────────────────────────────────────────────

    /**
     * Gọi AI với fallback + caching + rate limiting.
     * Trả về null nếu tất cả provider thất bại → caller dùng mockResponse().
     */
    public GeminiService.GeminiResult generate(String userMessage, String context) {

        // 1. Kiểm tra cache trước (tránh gọi API không cần thiết)
        String cacheKey = buildCacheKey(userMessage, context);
        GeminiService.GeminiResult cached = getFromCache(cacheKey);
        if (cached != null) {
            log.debug("[AI] Cache hit: '{}'", truncate(userMessage));
            return cached;
        }

        // 2. Giới hạn concurrency — tránh burst → Cloudflare block
        boolean acquired;
        try {
            acquired = concurrencyGuard.tryAcquire(5, TimeUnit.SECONDS);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            return null;
        }
        if (!acquired) {
            log.warn("[AI] Concurrency limit reached — returning null for fallback");
            return null;
        }

        try {
            // 3. Thử từng provider theo thứ tự ưu tiên
            for (Provider provider : buildProviders()) {
                if (isRateLimited(provider)) {
                    log.debug("[AI] Provider '{}' rate-limited — skipping", provider.name());
                    continue;
                }
                GeminiService.GeminiResult result = callProvider(provider, userMessage, context);
                if (result != null && result.getMessage() != null && !result.getMessage().isBlank()) {
                    putToCache(cacheKey, result);
                    return result;
                }
            }
        } finally {
            concurrencyGuard.release();
        }

        log.warn("[AI] All providers exhausted for: '{}'", truncate(userMessage));
        return null;
    }

    // ── Provider HTTP call ──────────────────────────────────────────────────

    private GeminiService.GeminiResult callProvider(Provider provider, String userMessage, String context) {
        try {
            String requestBody = provider.openAiCompat()
                    ? buildOpenAiRequest(userMessage, context, provider.model())
                    : buildGeminiRequest(userMessage, context);

            String url = provider.openAiCompat()
                    ? provider.url()
                    : provider.url() + "?key=" + provider.apiKey();

            HttpRequest.Builder reqBuilder = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                    .timeout(Duration.ofSeconds(25));

            if (provider.openAiCompat()) {
                reqBuilder.header("Authorization", "Bearer " + provider.apiKey());
            }

            HttpResponse<String> response = HttpClient.newBuilder()
                    .connectTimeout(Duration.ofSeconds(8))
                    .build()
                    .send(reqBuilder.build(), HttpResponse.BodyHandlers.ofString());

            // Đếm request dù thành công hay không (để track rate limit)
            incrementRateLimit(provider);

            if (response.statusCode() == 200) {
                log.info("[AI] Response from '{}'", provider.name());
                return provider.openAiCompat()
                        ? parseOpenAiResponse(response.body())
                        : parseGeminiResponse(response.body());

            } else if (response.statusCode() == 429) {
                log.warn("[AI] Provider '{}' returned 429 — marking as rate-limited", provider.name());
                markRateLimited(provider);

            } else {
                log.warn("[AI] Provider '{}' HTTP {}: {}",
                        provider.name(), response.statusCode(), truncate(response.body()));
            }
        } catch (Exception e) {
            log.warn("[AI] Provider '{}' call failed: {}", provider.name(), e.getMessage());
        }
        return null;
    }

    // ── Request builders ────────────────────────────────────────────────────

    private String buildOpenAiRequest(String userMessage, String context, String model) {
        String systemContent = escapeJson(GeminiService.SYSTEM_PROMPT + "\n\n" + context);
        String userContent   = escapeJson(userMessage);
        return """
            {
              "model": "%s",
              "messages": [
                {"role": "system", "content": "%s"},
                {"role": "user",   "content": "%s"}
              ],
              "temperature": 0.7,
              "max_tokens": 1024,
              "response_format": {"type": "json_object"}
            }
            """.formatted(model, systemContent, userContent);
    }

    private String buildGeminiRequest(String userMessage, String context) {
        String fullPrompt = escapeJson(
                GeminiService.SYSTEM_PROMPT + "\n\n" + context + "\n\nKhách hàng: " + userMessage);
        return """
            {
              "contents": [{"parts": [{"text": "%s"}]}],
              "generationConfig": {
                "temperature": 0.7,
                "maxOutputTokens": 1024,
                "responseMimeType": "application/json"
              }
            }
            """.formatted(fullPrompt);
    }

    private static String escapeJson(String s) {
        if (s == null) return "";
        return s.replace("\\", "\\\\")
                .replace("\"", "\\\"")
                .replace("\n", "\\n")
                .replace("\r", "");
    }

    // ── Response parsers ────────────────────────────────────────────────────

    /** Parse OpenAI-compatible response (Cerebras / Groq / DeepSeek) */
    private GeminiService.GeminiResult parseOpenAiResponse(String body) {
        try {
            // Structure: {"choices":[{"message":{"content":"<JSON string or object>"}}]}
            int idx = body.indexOf("\"content\":");
            if (idx == -1) return null;
            idx += 10;
            while (idx < body.length() && Character.isWhitespace(body.charAt(idx))) idx++;

            String jsonText;
            if (idx < body.length() && body.charAt(idx) == '"') {
                // Content là string escaped
                StringBuilder sb = new StringBuilder();
                idx++; // bỏ dấu "
                while (idx < body.length()) {
                    char c = body.charAt(idx);
                    if (c == '"' && body.charAt(idx - 1) != '\\') break;
                    sb.append(c);
                    idx++;
                }
                jsonText = sb.toString()
                        .replace("\\n", "\n")
                        .replace("\\\"", "\"")
                        .replace("\\\\", "\\");
            } else {
                // Content là object JSON trực tiếp
                int depth = 0, start = idx;
                while (idx < body.length()) {
                    char c = body.charAt(idx);
                    if (c == '{') depth++;
                    else if (c == '}') { depth--; if (depth == 0) { idx++; break; } }
                    idx++;
                }
                jsonText = body.substring(start, idx);
            }
            return extractResult(jsonText);
        } catch (Exception e) {
            log.warn("[AI] Failed to parse OpenAI response: {}", e.getMessage());
            return null;
        }
    }

    /** Parse Gemini response */
    private GeminiService.GeminiResult parseGeminiResponse(String body) {
        try {
            int textStart = body.indexOf("\"text\":") + 8;
            int textEnd   = body.lastIndexOf("\"");
            if (textStart < 8 || textEnd <= textStart) return null;
            String jsonText = body.substring(textStart, textEnd)
                    .replace("\\n", "\n")
                    .replace("\\\"", "\"");
            return extractResult(jsonText);
        } catch (Exception e) {
            log.warn("[AI] Failed to parse Gemini response: {}", e.getMessage());
            return null;
        }
    }

    /** Trích xuất GeminiResult từ JSON text của bot */
    private GeminiService.GeminiResult extractResult(String jsonText) {
        try {
            String  message           = extractField(jsonText, "message");
            double  confidence        = parseDouble(extractField(jsonText, "confidence"), 0.8);
            boolean suggestEscalation = Boolean.parseBoolean(extractField(jsonText, "suggest_escalation"));
            List<String> quickReplies = extractArray(jsonText, "quick_replies");
            List<Long>   bookIds      = extractLongArray(jsonText, "suggested_book_ids");

            if (message == null || message.isBlank()) return null;

            return GeminiService.GeminiResult.builder()
                    .message(message)
                    .confidence(confidence)
                    .suggestEscalation(suggestEscalation)
                    .quickReplies(quickReplies)
                    .suggestedBookIds(bookIds)
                    .build();
        } catch (Exception e) {
            log.warn("[AI] Failed to extract result: {}", e.getMessage());
            return null;
        }
    }

    // ── Rate limiting (Redis counters) ──────────────────────────────────────

    private String rlKey(Provider p) {
        long minute = Instant.now().getEpochSecond() / 60;
        return RL_PREFIX + p.name() + ":" + minute;
    }

    private boolean isRateLimited(Provider provider) {
        try {
            Object val = redisTemplate.opsForValue().get(rlKey(provider));
            return val != null && Integer.parseInt(val.toString()) >= provider.requestsPerMinute();
        } catch (Exception e) {
            return false; // Redis lỗi → cứ thử
        }
    }

    private void incrementRateLimit(Provider provider) {
        try {
            String key = rlKey(provider);
            redisTemplate.opsForValue().increment(key);
            redisTemplate.expire(key, 70, TimeUnit.SECONDS);
        } catch (Exception ignored) {}
    }

    private void markRateLimited(Provider provider) {
        try {
            redisTemplate.opsForValue().set(rlKey(provider),
                    provider.requestsPerMinute(), 70, TimeUnit.SECONDS);
        } catch (Exception ignored) {}
    }

    // ── Cache (Redis) ───────────────────────────────────────────────────────

    private String buildCacheKey(String userMessage, String context) {
        String normalized = (userMessage + "\n" + (context == null ? "" : context))
                .toLowerCase()
                .trim()
                .replaceAll("\\s+", " ");
        try {
            byte[] hash = MessageDigest.getInstance("SHA-256")
                    .digest(normalized.getBytes(StandardCharsets.UTF_8));
            return CACHE_PREFIX + HexFormat.of().formatHex(hash).substring(0, 16);
        } catch (Exception e) {
            return CACHE_PREFIX + Math.abs(normalized.hashCode());
        }
    }

    private GeminiService.GeminiResult getFromCache(String key) {
        try {
            Object cached = redisTemplate.opsForValue().get(key);
            if (cached == null) return null;
            return objectMapper.readValue(cached.toString(), GeminiService.GeminiResult.class);
        } catch (Exception e) {
            return null;
        }
    }

    private void putToCache(String key, GeminiService.GeminiResult result) {
        try {
            redisTemplate.opsForValue().set(
                    key, objectMapper.writeValueAsString(result),
                    CACHE_TTL_MIN, TimeUnit.MINUTES);
        } catch (Exception e) {
            log.debug("[AI] Cache write failed: {}", e.getMessage());
        }
    }

    // ── JSON parsing helpers ────────────────────────────────────────────────

    private String extractField(String json, String field) {
        try {
            String key = "\"" + field + "\":";
            int start = json.indexOf(key);
            if (start == -1) return "";
            start += key.length();
            while (start < json.length() && json.charAt(start) == ' ') start++;
            if (json.charAt(start) == '"') {
                int end = start + 1;
                while (end < json.length()) {
                    if (json.charAt(end) == '"' && json.charAt(end - 1) != '\\') break;
                    end++;
                }
                return json.substring(start + 1, end);
            } else {
                int end = json.indexOf(",", start);
                if (end == -1) end = json.indexOf("}", start);
                return json.substring(start, end).trim();
            }
        } catch (Exception e) { return ""; }
    }

    private List<String> extractArray(String json, String field) {
        List<String> result = new ArrayList<>();
        try {
            int start = json.indexOf("\"" + field + "\":");
            if (start == -1) return result;
            start = json.indexOf("[", start);
            int end = json.indexOf("]", start);
            if (start == -1 || end == -1) return result;
            for (String item : json.substring(start + 1, end).split(",")) {
                item = item.trim().replaceAll("^\"|\"$", "");
                if (!item.isEmpty()) result.add(item);
            }
        } catch (Exception ignored) {}
        return result;
    }

    private List<Long> extractLongArray(String json, String field) {
        List<Long> result = new ArrayList<>();
        for (String s : extractArray(json, field)) {
            try { result.add(Long.parseLong(s.trim())); } catch (NumberFormatException ignored) {}
        }
        return result;
    }

    private double parseDouble(String s, double def) {
        try { return (s != null && !s.isBlank()) ? Double.parseDouble(s.trim()) : def; }
        catch (Exception e) { return def; }
    }

    private static String truncate(String s) {
        return s != null && s.length() > 80 ? s.substring(0, 80) + "…" : s;
    }
}
