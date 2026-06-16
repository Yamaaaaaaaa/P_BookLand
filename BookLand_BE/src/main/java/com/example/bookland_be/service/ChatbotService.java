package com.example.bookland_be.service;

import com.example.bookland_be.dto.request.CreateChatbotSessionRequest;
import com.example.bookland_be.dto.request.SendChatbotMessageRequest;
import com.example.bookland_be.dto.response.ChatbotMessageResponse;
import com.example.bookland_be.dto.response.ChatbotMessageResponse.BookSuggestionDTO;
import com.example.bookland_be.dto.response.ChatbotMessageResponse.ChatMessageDTO;
import com.example.bookland_be.dto.response.ChatbotSessionResponse;
import com.example.bookland_be.entity.*;
import com.example.bookland_be.entity.ChatMessage.ContentType;
import com.example.bookland_be.entity.ChatMessage.MessageRole;
import com.example.bookland_be.entity.ChatbotSession.SessionStatus;
import com.example.bookland_be.entity.ChatbotSession.SessionType;
import com.example.bookland_be.repository.*;
import com.example.bookland_be.service.GeminiService.GeminiResult;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ChatbotService {

    private final ChatbotSessionRepository sessionRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final BookRepository bookRepository;
    private final UserRepository userRepository;
    private final GeminiService geminiService;
    private final SimpMessagingTemplate messagingTemplate;
    private final ObjectMapper objectMapper;

    /** Số lần hỏi lặp trước khi tự động escalate */
    private static final int REPEATED_QUESTION_THRESHOLD = 3;
    /** Ngưỡng confidence để tự động escalate */
    private static final double LOW_CONFIDENCE_THRESHOLD = 0.65;

    // ── Session Management ──────────────────────────────────────────────────

    /**
     * Tạo hoặc tái sử dụng session chatbot.
     * - User đã đăng nhập: tạo session mới với userId
     * - Guest: tạo session mới với guestToken
     */
    @Transactional
    public ChatbotSessionResponse createOrResumeSession(CreateChatbotSessionRequest request,
                                                         Long currentUserId) {
        if (currentUserId == null) {
            String guestSessionId = request.getGuestToken();
            if (guestSessionId == null || guestSessionId.isBlank()) {
                guestSessionId = UUID.randomUUID().toString();
            }
            return ChatbotSessionResponse.builder()
                    .sessionId(guestSessionId)
                    .sessionType(SessionType.GUEST.name())
                    .status(SessionStatus.ACTIVE.name())
                    .startedAt(LocalDateTime.now())
                    .lastActivity(LocalDateTime.now())
                    .messageCount(0)
                    .build();
        }

        ChatbotSession session;

        if (currentUserId != null) {
            // User đã đăng nhập — tìm session active hoặc tạo mới
            session = sessionRepository
                .findFirstByUserIdAndStatusOrderByStartedAtDesc(currentUserId, SessionStatus.ACTIVE)
                .orElseGet(() -> createNewSession(currentUserId, null, SessionType.USER));
        } else {
            // Guest
            String guestToken = request.getGuestToken();
            if (guestToken == null || guestToken.isBlank()) {
                throw new IllegalArgumentException("guest_token is required for unauthenticated sessions");
            }
            session = sessionRepository
                .findFirstByGuestTokenAndStatusOrderByStartedAtDesc(guestToken, SessionStatus.ACTIVE)
                .orElseGet(() -> createNewSession(null, guestToken, SessionType.GUEST));
        }

        return toSessionResponse(session);
    }

    private ChatbotSession createNewSession(Long userId, String guestToken, SessionType type) {
        User user = userId != null ? userRepository.findById(userId).orElse(null) : null;

        ChatbotSession session = ChatbotSession.builder()
                .id(UUID.randomUUID().toString())
                .user(user)
                .guestToken(guestToken)
                .sessionType(type)
                .status(SessionStatus.ACTIVE)
                .messageCount(0)
                .build();

        ChatbotSession saved = sessionRepository.save(session);
        log.info("Created new chatbot session: {} type={}", saved.getId(), type);

        // Gửi welcome message
        saveSystemMessage(saved, buildWelcomeMessage(user));
        return saved;
    }

    // ── Message Processing ──────────────────────────────────────────────────

    /**
     * Xử lý tin nhắn từ khách và trả về phản hồi bot.
     */
    @Transactional
    public ChatbotMessageResponse processMessage(String sessionId,
                                                  SendChatbotMessageRequest request,
                                                  Long currentUserId,
                                                  String guestToken) {
        if (currentUserId == null) {
            return processGuestMessage(sessionId, request);
        }

        // Validate session tồn tại và còn active
        ChatbotSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new IllegalArgumentException("Session not found: " + sessionId));

        if (session.getStatus() != SessionStatus.ACTIVE) {
            throw new IllegalStateException("Session is not active: " + session.getStatus());
        }

        // Validate ownership
        boolean isOwner = isSessionOwner(session, currentUserId, guestToken);
        if (!isOwner) {
            throw new SecurityException("Access denied to session: " + sessionId);
        }

        String userContent = request.getContent().trim();
        if (userContent.isBlank()) {
            throw new IllegalArgumentException("Message content cannot be empty");
        }

        // 1. Lưu tin nhắn của user
        ChatMessage userMsg = saveUserMessage(session, userContent, currentUserId);

        // 2. Build chat history cho AI context
        List<String> chatHistory = buildChatHistory(sessionId);

        // 3. Build context (knowledge base + sách)
        String context = geminiService.buildContext(userContent, chatHistory);

        // 4. Gọi Gemini API với error handling
        GeminiResult geminiResult;
        try {
            geminiResult = geminiService.generateResponse(userContent, context);
            log.info("[Chatbot] User message processed: userId={}, confidence={}", currentUserId, geminiResult.getConfidence());
        } catch (Exception e) {
            log.error("[Chatbot] Gemini API error for userId={}: {}", currentUserId, e.getMessage(), e);
            // Fallback response khi API fail
            geminiResult = new GeminiResult();
            geminiResult.setMessage("Xin lỗi, chatbot gặp sự cố tạm thời. Vui lòng thử lại sau hoặc liên hệ admin.");
            geminiResult.setConfidence(0.0);
            geminiResult.setSuggestEscalation(true);
            geminiResult.setQuickReplies(List.of("Gặp admin", "Thử lại"));
            geminiResult.setSuggestedBookIds(new ArrayList<>());
        }

        if (geminiResult.getSuggestedBookIds() == null) {
            geminiResult.setSuggestedBookIds(new ArrayList<>());
        }
        if (geminiResult.getQuickReplies() == null) {
            geminiResult.setQuickReplies(new ArrayList<>());
        }

        // 5. Kiểm tra các trigger tự động escalate
        boolean shouldEscalate = geminiResult.isSuggestEscalation()
                || geminiResult.getConfidence() < LOW_CONFIDENCE_THRESHOLD;

        // 6. Lấy thông tin sách được gợi ý (nếu có)
        if (geminiResult.getSuggestedBookIds().isEmpty()) {
            List<Long> fallbackBookIds = findFallbackBookIds(userContent);
            if (!fallbackBookIds.isEmpty()) {
                geminiResult.setSuggestedBookIds(fallbackBookIds);
                geminiResult.setMessage(appendBookLinks(geminiResult.getMessage(), fallbackBookIds));
            }
        }

        List<BookSuggestionDTO> bookSuggestions = new ArrayList<>();
        ContentType botContentType = ContentType.TEXT;
        String metadata = null;

        if (!geminiResult.getSuggestedBookIds().isEmpty()) {
            bookSuggestions = fetchBookSuggestions(geminiResult.getSuggestedBookIds());
            botContentType = ContentType.PRODUCT_CARD;
            metadata = buildProductMetadata(bookSuggestions);
        } else if (!geminiResult.getQuickReplies().isEmpty()) {
            botContentType = ContentType.QUICK_REPLY;
            metadata = buildQuickReplyMetadata(geminiResult.getQuickReplies());
        }

        // 7. Lưu tin nhắn bot
        ChatMessage botMsg = saveBotMessage(session, geminiResult.getMessage(),
                geminiResult.getConfidence(), botContentType, metadata);

        // 8. Cập nhật session
        session.setLastActivity(LocalDateTime.now());
        session.setMessageCount(session.getMessageCount() + 2); // user + bot
        sessionRepository.save(session);

        // 9. Build response
        ChatbotMessageResponse response = ChatbotMessageResponse.builder()
                .userMessage(toChatMessageDTO(userMsg))
                .botResponse(toChatMessageDTO(botMsg))
                .confidence(geminiResult.getConfidence())
                .quickReplies(geminiResult.getQuickReplies())
                .productSuggestions(bookSuggestions)
                .suggestEscalation(shouldEscalate)
                .build();

        // 10. Nếu user đã đăng nhập → gửi qua WebSocket
        if (currentUserId != null) {
            User user = userRepository.findById(currentUserId).orElse(null);
            if (user != null) {
                messagingTemplate.convertAndSendToUser(user.getEmail(), "/queue/chatbot", response);
            }
        }

        return response;
    }

    /**
     * Xử lý tin nhắn từ guest (không đăng nhập).
     * LƯU Ý: Guest message KHÔNG lưu vào database - chỉ trả response ngay.
     * Lịch sử chat chỉ lưu khi user đã đăng nhập.
     */
    private ChatbotMessageResponse processGuestMessage(String sessionId, SendChatbotMessageRequest request) {
        String userContent = request.getContent() != null ? request.getContent().trim() : "";
        if (userContent.isBlank()) {
            throw new IllegalArgumentException("Message content cannot be empty");
        }

        // Build context (không lấy chat history vì guest không lưu)
        String context = geminiService.buildContext(userContent, List.of());

        // Gọi Gemini với error handling
        GeminiResult geminiResult;
        try {
            geminiResult = geminiService.generateResponse(userContent, context);
            log.info("[Chatbot] Guest message processed: confidence={}", geminiResult.getConfidence());
        } catch (Exception e) {
            log.error("[Chatbot] Gemini API error for guest: {}", e.getMessage(), e);
            // Fallback response khi API fail
            geminiResult = new GeminiResult();
            geminiResult.setMessage("Xin lỗi, chatbot gặp sự cố tạm thời. Vui lòng thử lại sau hoặc liên hệ admin.");
            geminiResult.setConfidence(0.0);
            geminiResult.setSuggestEscalation(true);
            geminiResult.setQuickReplies(List.of("Gặp admin", "Thử lại"));
            geminiResult.setSuggestedBookIds(new ArrayList<>());
        }

        if (geminiResult.getSuggestedBookIds() == null) {
            geminiResult.setSuggestedBookIds(new ArrayList<>());
        }
        if (geminiResult.getQuickReplies() == null) {
            geminiResult.setQuickReplies(new ArrayList<>());
        }

        // Kiểm tra auto-escalation
        boolean shouldEscalate = geminiResult.isSuggestEscalation()
                || geminiResult.getConfidence() < LOW_CONFIDENCE_THRESHOLD;

        // Fallback book suggestions
        if (geminiResult.getSuggestedBookIds().isEmpty()) {
            List<Long> fallbackBookIds = findFallbackBookIds(userContent);
            if (!fallbackBookIds.isEmpty()) {
                geminiResult.setSuggestedBookIds(fallbackBookIds);
                geminiResult.setMessage(appendBookLinks(geminiResult.getMessage(), fallbackBookIds));
            }
        }

        // Fetch book suggestions
        List<BookSuggestionDTO> bookSuggestions = new ArrayList<>();
        ContentType botContentType = ContentType.TEXT;
        String metadata = null;

        if (!geminiResult.getSuggestedBookIds().isEmpty()) {
            bookSuggestions = fetchBookSuggestions(geminiResult.getSuggestedBookIds());
            botContentType = ContentType.PRODUCT_CARD;
            metadata = buildProductMetadata(bookSuggestions);
        } else if (!geminiResult.getQuickReplies().isEmpty()) {
            botContentType = ContentType.QUICK_REPLY;
            metadata = buildQuickReplyMetadata(geminiResult.getQuickReplies());
        }

        // Tạo DTO để trả về (KHÔNG lưu DB)
        LocalDateTime now = LocalDateTime.now();
        ChatMessageDTO userMessage = ChatMessageDTO.builder()
                .sessionId(sessionId)
                .role(MessageRole.USER.name())
                .contentType(ContentType.TEXT.name())
                .content(userContent)
                .createdAt(now)
                .build();

        ChatMessageDTO botResponse = ChatMessageDTO.builder()
                .sessionId(sessionId)
                .role(MessageRole.ASSISTANT.name())
                .contentType(botContentType.name())
                .content(geminiResult.getMessage())
                .aiConfidence(geminiResult.getConfidence())
                .metadata(metadata)
                .createdAt(now)
                .build();

        // Trả về response (không lưu database)
        return ChatbotMessageResponse.builder()
                .userMessage(userMessage)
                .botResponse(botResponse)
                .confidence(geminiResult.getConfidence())
                .quickReplies(geminiResult.getQuickReplies())
                .productSuggestions(bookSuggestions)
                .suggestEscalation(shouldEscalate)
                .build();
    }

    /**
     * Lấy lịch sử chat của một session.
     * - User đã đăng nhập: lấy từ database
     * - Guest: chỉ trả welcome message (không lưu lịch sử)
     */
    @Transactional(readOnly = true)
    public List<ChatMessageDTO> getSessionHistory(String sessionId,
                                                   Long currentUserId,
                                                   String guestToken) {
        // Guest không lưu lịch sử - chỉ trả welcome message
        if (currentUserId == null) {
            return List.of(ChatMessageDTO.builder()
                    .sessionId(sessionId)
                    .role(MessageRole.ASSISTANT.name())
                    .contentType(ContentType.QUICK_REPLY.name())
                    .content(buildWelcomeMessage(null))
                    .aiConfidence(1.0)
                    .metadata("{\"options\":[\"Gợi ý sách 📚\",\"Tra đơn hàng 📦\",\"Chính sách đổi trả 🔄\",\"Gặp admin 💬\"]}")
                    .createdAt(LocalDateTime.now())
                    .build());
        }

        // User đã đăng nhập: lấy lịch sử từ database
        ChatbotSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new IllegalArgumentException("Session not found: " + sessionId));

        if (!isSessionOwner(session, currentUserId, guestToken)) {
            throw new SecurityException("Access denied to session: " + sessionId);
        }

        List<ChatMessageDTO> history = chatMessageRepository.findBySessionIdOrderByCreatedAtAsc(sessionId)
                .stream()
                .map(this::toChatMessageDTO)
                .collect(Collectors.toList());

        // Nếu session mới tạo (chưa có message) → thêm welcome message
        if (history.isEmpty()) {
            history.add(ChatMessageDTO.builder()
                    .sessionId(sessionId)
                    .role(MessageRole.ASSISTANT.name())
                    .contentType(ContentType.QUICK_REPLY.name())
                    .content(buildWelcomeMessage(session.getUser()))
                    .aiConfidence(1.0)
                    .metadata("{\"options\":[\"Gợi ý sách 📚\",\"Tra đơn hàng 📦\",\"Chính sách đổi trả 🔄\",\"Gặp admin 💬\"]}")
                    .createdAt(LocalDateTime.now())
                    .build());
        }

        return history;
    }

    /**
     * Đóng session chatbot.
     */
    @Transactional
    public void closeSession(String sessionId, Long currentUserId, String guestToken) {
        if (currentUserId == null) {
            return;
        }

        ChatbotSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new IllegalArgumentException("Session not found: " + sessionId));

        if (!isSessionOwner(session, currentUserId, guestToken)) {
            throw new SecurityException("Access denied to session: " + sessionId);
        }

        session.setStatus(SessionStatus.CLOSED);
        session.setClosedAt(LocalDateTime.now());
        sessionRepository.save(session);
        log.info("Session closed: {}", sessionId);
    }

    // ── Helper Methods ──────────────────────────────────────────────────────

    private boolean isSessionOwner(ChatbotSession session, Long userId, String guestToken) {
        if (userId != null && session.getUser() != null) {
            return session.getUser().getId().equals(userId);
        }
        if (guestToken != null && session.getGuestToken() != null) {
            return session.getGuestToken().equals(guestToken);
        }
        return false;
    }

    private ChatMessage saveUserMessage(ChatbotSession session, String content, Long userId) {
        User user = userId != null ? userRepository.findById(userId).orElse(null) : null;

        ChatMessage msg = ChatMessage.builder()
                .fromUser(user)
                .toUser(user)
                .content(content)
                .sessionId(session.getId())
                .role(MessageRole.USER)
                .contentType(ContentType.TEXT)
                .isRead(true)
                .build();

        return chatMessageRepository.save(msg);
    }

    private ChatMessage saveBotMessage(ChatbotSession session, String content,
                                        double confidence, ContentType contentType, String metadata) {
        User user = session.getUser();
        ChatMessage msg = ChatMessage.builder()
                .fromUser(user)
                .toUser(user)
                .content(content)
                .sessionId(session.getId())
                .role(MessageRole.ASSISTANT)
                .contentType(contentType)
                .aiConfidence(confidence)
                .metadata(metadata)
                .isRead(true)
                .build();

        return chatMessageRepository.save(msg);
    }

    private void saveSystemMessage(ChatbotSession session, String content) {
        User user = session.getUser();
        ChatMessage msg = ChatMessage.builder()
                .fromUser(user)
                .toUser(user)
                .content(content)
                .sessionId(session.getId())
                .role(MessageRole.ASSISTANT)
                .contentType(ContentType.QUICK_REPLY)
                .aiConfidence(1.0)
                .metadata("{\"options\":[\"Gợi ý sách 📚\",\"Tra đơn hàng 📦\",\"Chính sách đổi trả 🔄\",\"Gặp admin 💬\"]}")
                .isRead(true)
                .build();

        chatMessageRepository.save(msg);
    }

    private String buildWelcomeMessage(User user) {
        if (user != null) {
            String name = user.getFirstName() != null ? user.getFirstName() : user.getUsername();
            return "Dạ chào " + name + "! 😊 Tôi là BookBot, trợ lý AI của BookLand. Tôi có thể giúp gì cho bạn hôm nay?";
        }
        return "Xin chào! 😊 Tôi là BookBot, trợ lý AI của BookLand. Tôi có thể giúp gì cho bạn?";
    }

    private List<String> buildChatHistory(String sessionId) {
        return chatMessageRepository.findBySessionIdOrderByCreatedAtAsc(sessionId)
                .stream()
                .limit(20) // Giới hạn 20 tin nhắn gần nhất
                .map(msg -> {
                    String prefix = msg.getRole() == MessageRole.USER ? "Khách: " : "BookBot: ";
                    return prefix + msg.getContent();
                })
                .collect(Collectors.toList());
    }

    private List<BookSuggestionDTO> fetchBookSuggestions(List<Long> bookIds) {
        return bookRepository.findAllById(bookIds).stream()
                .filter(b -> b.getStatus() == Book.BookStatus.ENABLE && b.getStock() > 0)
                .map(b -> BookSuggestionDTO.builder()
                        .id(b.getId())
                        .name(b.getName())
                        .bookImageUrl(b.getBookImageUrl())
                        .originalCost(b.getOriginalCost())
                        .sale(b.getSale())
                        .finalPrice(b.getFinalPrice())
                        .stock(b.getStock())
                        .reason("Được BookBot gợi ý")
                        .productUrl("/shop/book-detail/" + b.getId())
                        .build())
                .collect(Collectors.toList());
    }

    private List<Long> findFallbackBookIds(String userContent) {
        if (!isBookQuery(userContent)) {
            return List.of();
        }
        Set<Long> ids = new LinkedHashSet<>();
        for (String keyword : buildBookKeywords(userContent)) {
            bookRepository.searchAvailableBooksForChatbot(keyword, PageRequest.of(0, 5))
                    .forEach(book -> ids.add(book.getId()));
            if (ids.size() >= 5) break;
        }
        return ids.stream().limit(5).collect(Collectors.toList());
    }

    private boolean isBookQuery(String userContent) {
        String normalized = userContent == null ? "" : userContent.toLowerCase();
        return normalized.contains("sách")
                || normalized.contains("truyện")
                || normalized.contains("manga")
                || normalized.contains("comic")
                || normalized.contains("gợi ý")
                || normalized.contains("tìm")
                || normalized.contains("mua");
    }

    private List<String> buildBookKeywords(String userContent) {
        String normalized = userContent == null ? "" : userContent.toLowerCase().trim();
        List<String> keywords = new ArrayList<>();
        if (normalized.contains("truyện tranh") || normalized.contains("manga") || normalized.contains("comic")) {
            keywords.add("truyện tranh");
            keywords.add("manga");
        }
        if (normalized.contains("văn học")) keywords.add("văn học");
        if (normalized.contains("tiểu thuyết")) keywords.add("tiểu thuyết");
        if (normalized.contains("thiếu nhi") || normalized.contains("trẻ em")) keywords.add("thiếu nhi");
        if (normalized.contains("kinh tế")) keywords.add("kinh tế");
        if (normalized.contains("khoa học")) keywords.add("khoa học");
        if (!normalized.isBlank()) keywords.add(normalized);
        keywords.add("");
        return keywords.stream().distinct().collect(Collectors.toList());
    }

    private String appendBookLinks(String message, List<Long> bookIds) {
        String links = bookIds.stream()
                .map(id -> "/shop/book-detail/" + id)
                .collect(Collectors.joining("\n"));
        if (message == null || message.isBlank()) {
            return "Dạ, tôi tìm thấy một số sách phù hợp trong BookLand:\n" + links;
        }
        return message + "\n\nBạn có thể xem chi tiết tại:\n" + links;
    }

    private String buildProductMetadata(List<BookSuggestionDTO> products) {
        try {
            return objectMapper.writeValueAsString(Map.of("products", products));
        } catch (JsonProcessingException e) {
            log.warn("Failed to serialize chatbot product metadata", e);
            return "{\"products\":[]}";
        }
    }

    private String buildQuickReplyMetadata(List<String> options) {
        String opts = options.stream()
                .map(o -> "\"" + o.replace("\"", "\\\"") + "\"")
                .collect(Collectors.joining(","));
        return "{\"options\":[" + opts + "]}";
    }

    private ChatMessageDTO toChatMessageDTO(ChatMessage msg) {
        return ChatMessageDTO.builder()
                .id(msg.getId())
                .sessionId(msg.getSessionId())
                .role(msg.getRole().name())
                .contentType(msg.getContentType().name())
                .content(msg.getContent())
                .aiConfidence(msg.getAiConfidence())
                .metadata(msg.getMetadata())
                .createdAt(msg.getCreatedAt())
                .build();
    }

    private ChatbotSessionResponse toSessionResponse(ChatbotSession session) {
        return ChatbotSessionResponse.builder()
                .sessionId(session.getId())
                .sessionType(session.getSessionType().name())
                .status(session.getStatus().name())
                .startedAt(session.getStartedAt())
                .lastActivity(session.getLastActivity())
                .messageCount(session.getMessageCount())
                .build();
    }
}
