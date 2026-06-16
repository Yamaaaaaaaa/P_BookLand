package com.example.bookland_be.service;

import com.example.bookland_be.entity.Book;
import com.example.bookland_be.entity.ChatbotKnowledge;
import com.example.bookland_be.repository.BookRepository;
import com.example.bookland_be.repository.ChatbotKnowledgeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * GeminiService — Tích hợp Google Gemini API.
 *
 * Phase 3: Đây là stub ban đầu trả về mock response.
 * Khi tích hợp Gemini thực sự, replace phần generateResponse().
 *
 * Endpoint Gemini: POST https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class GeminiService {

    private final ChatbotKnowledgeRepository knowledgeRepository;
    private final BookRepository bookRepository;
    private final RedisTemplate<Object, Object> redisTemplate;
    private final AiProviderService aiProviderService;

    @Value("${gemini.api.key:}")
    private String geminiApiKey;

    @Value("${gemini.api.url:https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent}")
    private String geminiApiUrl;

    /** Package-private: dùng bởi AiProviderService trong cùng package */
    static final String SYSTEM_PROMPT = """
        Bạn là BookBot - trợ lý AI của BookLand, website bán sách và truyện online tại Việt Nam.
        
        ## Vai trò
        - Tư vấn sách và truyện theo nhu cầu khách hàng
        - Hỗ trợ thông tin đơn hàng, thanh toán, giao hàng (chỉ đọc, không thay đổi)
        - Hướng dẫn sử dụng website
        - Chuyển tiếp sang admin khi cần
        
        ## Nguyên tắc tuyệt đối
        1. KHÔNG tự ý xác nhận, hủy hoặc thay đổi đơn hàng
        2. KHÔNG cam kết giá hoặc chính sách đặc biệt ngoài thông tin có sẵn
        3. KHÔNG trả lời chủ đề ngoài phạm vi sách/truyện/dịch vụ BookLand
        4. Luôn lịch sự, thân thiện, dùng tiếng Việt tự nhiên
        5. Khi gợi ý sản phẩm, CHỈ dùng sách có trong mục "Sách trong DB phù hợp" và đưa id vào suggested_book_ids
        6. Nếu không có sách phù hợp trong context, hãy hỏi thêm nhu cầu hoặc nói thông tin còn hạn chế, không bịa tên sách
        7. KHÔNG chèn link, URL hay ID sản phẩm vào nội dung tin nhắn. Hệ thống sẽ tự động hiển thị thẻ sản phẩm.
        8. CHỈ sử dụng tiếng Việt, tuyệt đối không chèn tiếng Trung (như 喜欢) hay ngôn ngữ khác.
        
        ## Khi nào chuyển sang admin (đặt suggest_escalation: true)
        - Khách yêu cầu gặp người thật
        - Khách khiếu nại về đơn hàng/dịch vụ
        - Bạn không chắc chắn (confidence < 0.65)
        - Câu hỏi vượt phạm vi
        
        ## Format output (JSON)
        {
          "message": "Nội dung trả lời bằng tiếng Việt",
          "confidence": 0.85,
          "suggest_escalation": false,
          "quick_replies": ["Option 1", "Option 2"],
          "suggested_book_ids": [1, 2, 3]
        }
        
        Chỉ trả về JSON, không có text ngoài JSON.
        """;

    /**
     * Tạo context từ knowledge base + thông tin sách để đưa vào prompt.
     */
    public String buildContext(String userQuery, List<String> chatHistory) {
        // Tìm knowledge liên quan
        List<ChatbotKnowledge> relevantKnowledge;
        try {
            relevantKnowledge = knowledgeRepository.searchByFullText(
                userQuery.replaceAll("[^a-zA-Z0-9àáạảãâầấậẩẫăắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ\\s]", "")
            );
        } catch (Exception e) {
            log.warn("Full-text search failed, loading all active knowledge: {}", e.getMessage());
            relevantKnowledge = knowledgeRepository.findByIsActiveTrueOrderByPriorityDesc();
        }

        StringBuilder context = new StringBuilder();
        if (!relevantKnowledge.isEmpty()) {
            context.append("## Thông tin chính sách BookLand\n");
            for (ChatbotKnowledge k : relevantKnowledge) {
                context.append("### ").append(k.getTitle()).append("\n");
                context.append(k.getContent()).append("\n\n");
            }
        }

        List<Book> relevantBooks = findRelevantBooks(userQuery);
        if (!relevantBooks.isEmpty()) {
            context.append("## Sách trong DB phù hợp\n");
            context.append("Chỉ gợi ý sách từ danh sách này.\n");
            for (Book book : relevantBooks) {
                context.append("- ID: ").append(book.getId()).append("\n");
                context.append("  Tên: ").append(book.getName()).append("\n");
                context.append("  Giá: ").append(formatPrice(book.getFinalPrice())).append("\n");
                context.append("  Giảm giá: ").append(book.getSale() != null ? book.getSale() : 0).append("%\n");
                context.append("  Tồn kho: ").append(book.getStock()).append("\n");
                if (book.getAuthor() != null) {
                    context.append("  Tác giả: ").append(book.getAuthor().getName()).append("\n");
                }
                if (book.getCategories() != null && !book.getCategories().isEmpty()) {
                    context.append("  Thể loại: ")
                            .append(book.getCategories().stream()
                                    .map(c -> c.getName())
                                    .collect(Collectors.joining(", ")))
                            .append("\n");
                }
                if (book.getDescription() != null && !book.getDescription().isBlank()) {
                    context.append("  Mô tả ngắn: ")
                            .append(truncate(book.getDescription().replaceAll("\\s+", " "), 220))
                            .append("\n");
                }
                context.append("\n");
            }
        }

        // Lịch sử chat gần nhất (tối đa 10 tin)
        if (!chatHistory.isEmpty()) {
            context.append("## Lịch sử hội thoại\n");
            int start = Math.max(0, chatHistory.size() - 10);
            for (int i = start; i < chatHistory.size(); i++) {
                context.append(chatHistory.get(i)).append("\n");
            }
        }

        return context.toString();
    }

    private List<Book> findRelevantBooks(String userQuery) {
        if (!isBookQuery(userQuery)) {
            return List.of();
        }
        List<String> keywords = buildBookSearchKeywords(userQuery);
        List<Book> books = new ArrayList<>();
        for (String keyword : keywords) {
            List<Book> found = bookRepository.searchAvailableBooksForChatbot(keyword, PageRequest.of(0, 8));
            for (Book book : found) {
                if (books.stream().noneMatch(existing -> existing.getId().equals(book.getId()))) {
                    books.add(book);
                }
                if (books.size() >= 8) return books;
            }
        }
        return books;
    }

    private boolean isBookQuery(String userQuery) {
        String normalized = userQuery == null ? "" : userQuery.toLowerCase();
        return normalized.contains("sách")
                || normalized.contains("truyện")
                || normalized.contains("manga")
                || normalized.contains("comic")
                || normalized.contains("gợi ý")
                || normalized.contains("tìm")
                || normalized.contains("mua");
    }

    private List<String> buildBookSearchKeywords(String userQuery) {
        String normalized = userQuery == null ? "" : userQuery.toLowerCase()
                .replaceAll("[^a-zA-Z0-9àáạảãâầấậẩẫăắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ\\s]", " ")
                .replaceAll("\\s+", " ")
                .trim();

        List<String> keywords = new ArrayList<>();
        if (normalized.contains("truyện tranh") || normalized.contains("manga") || normalized.contains("comic")) {
            keywords.add("truyện tranh");
            keywords.add("manga");
        }
        if (normalized.contains("tiểu thuyết")) keywords.add("tiểu thuyết");
        if (normalized.contains("văn học")) keywords.add("văn học");
        if (normalized.contains("thiếu nhi") || normalized.contains("trẻ em")) keywords.add("thiếu nhi");
        if (normalized.contains("kinh tế")) keywords.add("kinh tế");
        if (normalized.contains("khoa học")) keywords.add("khoa học");
        if (normalized.contains("harry")) keywords.add("harry");
        if (normalized.contains("nguyễn nhật ánh")) keywords.add("nguyễn nhật ánh");
        if (!normalized.isBlank()) keywords.add(normalized);
        keywords.add("");
        return keywords.stream().distinct().toList();
    }

    private String formatPrice(Double price) {
        if (price == null) return "Chưa có giá";
        return String.format("%,.0f VND", price);
    }

    private String truncate(String value, int maxLength) {
        if (value == null || value.length() <= maxLength) return value;
        return value.substring(0, maxLength) + "...";
    }

    /**
     * Gọi Gemini API và parse response.
     * Nếu API key chưa cấu hình → trả mock response để dev/test.
     */
    /**
     * Gọi AI qua AiProviderService (Cerebras → Groq → DeepSeek → Gemini).
     * Nếu tất cả provider thất bại → dùng mockResponse() thông minh.
     */
    public GeminiResult generateResponse(String userMessage, String context) {
        GeminiResult result = aiProviderService.generate(userMessage, context);
        if (result != null) return result;
        log.info("[Gemini] All AI providers unavailable — using intelligent mock response");
        return mockResponse(userMessage);
    }

    private String buildGeminiRequest(String userMessage, String context) {
        String fullPrompt = SYSTEM_PROMPT + "\n\n" + context + "\n\nKhách hàng: " + userMessage;
        // Escape quotes trong JSON
        fullPrompt = fullPrompt.replace("\\", "\\\\").replace("\"", "\\\"").replace("\n", "\\n");
        return """
            {
              "contents": [{
                "parts": [{
                  "text": "%s"
                }]
              }],
              "generationConfig": {
                "temperature": 0.7,
                "maxOutputTokens": 1024,
                "responseMimeType": "application/json"
              }
            }
            """.formatted(fullPrompt);
    }

    private GeminiResult parseGeminiResponse(String responseBody) {
        try {
            // Extract text từ Gemini response JSON
            // Structure: {"candidates":[{"content":{"parts":[{"text":"..."}]}}]}
            int textStart = responseBody.indexOf("\"text\":") + 8;
            int textEnd = responseBody.lastIndexOf("\"") ;
            String jsonText = responseBody.substring(textStart, textEnd)
                    .replace("\\n", "\n")
                    .replace("\\\"", "\"");

            // Parse JSON từ bot
            String message = extractJsonField(jsonText, "message");
            double confidence = Double.parseDouble(extractJsonField(jsonText, "confidence", "0.8"));
            boolean suggestEscalation = Boolean.parseBoolean(extractJsonField(jsonText, "suggest_escalation", "false"));

            List<String> quickReplies = extractJsonArray(jsonText, "quick_replies");
            List<Long> bookIds = extractJsonLongArray(jsonText, "suggested_book_ids");

            return GeminiResult.builder()
                    .message(message)
                    .confidence(confidence)
                    .suggestEscalation(suggestEscalation)
                    .quickReplies(quickReplies)
                    .suggestedBookIds(bookIds)
                    .build();
        } catch (Exception e) {
            log.error("Failed to parse Gemini response: {}", e.getMessage());
            return fallbackResponse("");
        }
    }

    /** Mock response khi chưa có Gemini API key (để dev/test frontend) */
    private GeminiResult mockResponse(String userMessage) {
        String lower = userMessage.toLowerCase();

        if (lower.contains("sách") || lower.contains("truyện") || lower.contains("gợi ý") || lower.contains("tìm")) {
            return GeminiResult.builder()
                    .message("Dạ, tôi rất vui được giúp bạn tìm sách! 📚 Để gợi ý chính xác nhất, bạn cho tôi biết thêm:\n• Bạn thích thể loại gì? (văn học, khoa học, truyện tranh...)\n• Sách cho đối tượng nào? (trẻ em, thiếu niên, người lớn)\n• Ngân sách khoảng bao nhiêu?")
                    .confidence(0.85)
                    .suggestEscalation(false)
                    .quickReplies(List.of("Văn học", "Khoa học", "Truyện tranh", "Manga"))
                    .suggestedBookIds(List.of())
                    .build();
        }

        if (lower.contains("đơn hàng") || lower.contains("ship") || lower.contains("giao hàng")) {
            return GeminiResult.builder()
                    .message("Dạ, về chính sách giao hàng của BookLand:\n✅ **Miễn phí ship** cho đơn từ 150,000đ\n✅ Phí 25,000đ cho đơn dưới 150,000đ\n✅ Giao hàng 3-5 ngày làm việc\n✅ Giao nhanh 1-2 ngày (nội thành HCM, Hà Nội)")
                    .confidence(0.92)
                    .suggestEscalation(false)
                    .quickReplies(List.of("Theo dõi đơn hàng", "Đổi trả sách", "Hỏi thêm"))
                    .suggestedBookIds(List.of())
                    .build();
        }

        if (lower.contains("admin") || lower.contains("người thật") || lower.contains("nhân viên") || lower.contains("hỗ trợ")) {
            return GeminiResult.builder()
                    .message("Dạ, tôi hiểu bạn muốn được hỗ trợ trực tiếp từ nhân viên BookLand. Tôi sẽ chuyển bạn sang admin ngay! 🙋")
                    .confidence(0.95)
                    .suggestEscalation(true)
                    .quickReplies(List.of("Gặp admin ngay", "Tôi tự xử lý được"))
                    .suggestedBookIds(List.of())
                    .build();
        }

        // Default response
        return GeminiResult.builder()
                .message("Dạ, xin chào! Tôi là BookBot, trợ lý AI của BookLand 😊 Tôi có thể giúp bạn:\n📚 Tìm và gợi ý sách phù hợp\n📦 Thông tin đơn hàng và giao hàng\n🔄 Chính sách đổi trả\n💬 Kết nối với admin\n\nBạn cần hỗ trợ gì hôm nay?")
                .confidence(0.75)
                .suggestEscalation(false)
                .quickReplies(List.of("Gợi ý sách", "Tra đơn hàng", "Chính sách đổi trả", "Gặp admin"))
                .suggestedBookIds(List.of())
                .build();
    }

    private GeminiResult fallbackResponse(String userMessage) {
        return GeminiResult.builder()
                .message("Xin lỗi bạn, tôi đang gặp sự cố kỹ thuật. Bạn có muốn tôi chuyển sang admin để được hỗ trợ trực tiếp không? 🙏")
                .confidence(0.0)
                .suggestEscalation(true)
                .quickReplies(List.of("Gặp admin", "Thử lại"))
                .suggestedBookIds(List.of())
                .build();
    }

    // ── JSON parsing helpers ────────────────────────────────────────────────

    private String extractJsonField(String json, String field) {
        return extractJsonField(json, field, "");
    }

    private String extractJsonField(String json, String field, String defaultValue) {
        try {
            String key = "\"" + field + "\":";
            int start = json.indexOf(key);
            if (start == -1) return defaultValue;
            start += key.length();
            while (start < json.length() && json.charAt(start) == ' ') start++;
            if (json.charAt(start) == '"') {
                int end = json.indexOf("\"", start + 1);
                return json.substring(start + 1, end);
            } else {
                int end = json.indexOf(",", start);
                if (end == -1) end = json.indexOf("}", start);
                return json.substring(start, end).trim();
            }
        } catch (Exception e) {
            return defaultValue;
        }
    }

    private List<String> extractJsonArray(String json, String field) {
        List<String> result = new ArrayList<>();
        try {
            String key = "\"" + field + "\":";
            int start = json.indexOf(key);
            if (start == -1) return result;
            start = json.indexOf("[", start);
            int end = json.indexOf("]", start);
            if (start == -1 || end == -1) return result;
            String arr = json.substring(start + 1, end);
            for (String item : arr.split(",")) {
                item = item.trim().replaceAll("^\"|\"$", "");
                if (!item.isEmpty()) result.add(item);
            }
        } catch (Exception e) {
            log.debug("Failed to extract array {}: {}", field, e.getMessage());
        }
        return result;
    }

    private List<Long> extractJsonLongArray(String json, String field) {
        List<Long> result = new ArrayList<>();
        try {
            List<String> strs = extractJsonArray(json, field);
            for (String s : strs) {
                result.add(Long.parseLong(s.trim()));
            }
        } catch (Exception e) {
            log.debug("Failed to extract long array {}: {}", field, e.getMessage());
        }
        return result;
    }

    // ── Result DTO ──────────────────────────────────────────────────────────

    @lombok.Data
    @lombok.Builder
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    public static class GeminiResult {
        private String message;
        private double confidence;
        private boolean suggestEscalation;
        private List<String> quickReplies;
        private List<Long> suggestedBookIds;
    }
}
