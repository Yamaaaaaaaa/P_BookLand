package com.example.bookland_be.service;

import com.example.bookland_be.dto.request.CreateEscalationRequest;
import com.example.bookland_be.dto.response.EscalationResponse;
import com.example.bookland_be.entity.*;
import com.example.bookland_be.entity.ChatbotSession.SessionStatus;
import com.example.bookland_be.entity.Escalation.*;
import com.example.bookland_be.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class EscalationService {

    private final EscalationRepository escalationRepository;
    private final ChatbotSessionRepository sessionRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;

    /**
     * Tạo yêu cầu escalation mới — chuyển tiếp hội thoại sang admin.
     */
    @Transactional
    public EscalationResponse createEscalation(CreateEscalationRequest request,
                                                Long currentUserId,
                                                String guestToken) {
        ChatbotSession session = sessionRepository.findById(request.getSessionId())
                .orElseThrow(() -> new IllegalArgumentException("Session not found: " + request.getSessionId()));

        // Parse reason
        EscalationReason reason;
        try {
            reason = EscalationReason.valueOf(request.getReason().toUpperCase());
        } catch (Exception e) {
            reason = EscalationReason.USER_REQUEST;
        }

        // Auto-classify category dựa trên lịch sử chat
        EscalationCategory category = detectCategory(session.getId(), request.getMessage());
        EscalationPriority priority = detectPriority(category, reason);

        // Tạo AI summary (simple rule-based cho Phase 1, Gemini cho Phase 3+)
        String aiSummary = buildSimpleSummary(session.getId(), request.getMessage());

        User user = currentUserId != null ? userRepository.findById(currentUserId).orElse(null) : null;

        Escalation escalation = Escalation.builder()
                .id(UUID.randomUUID().toString())
                .session(session)
                .user(user)
                .reason(reason)
                .category(category)
                .priority(priority)
                .status(EscalationStatus.PENDING)
                .aiSummary(aiSummary)
                .build();

        Escalation saved = escalationRepository.save(escalation);

        // Cập nhật session status
        session.setStatus(SessionStatus.ESCALATED);
        sessionRepository.save(session);

        // Lưu system message thông báo cho khách
        saveEscalationSystemMessage(session, saved.getId());

        // Broadcast đến admin qua WebSocket
        EscalationResponse response = toEscalationResponse(saved);
        messagingTemplate.convertAndSend("/topic/escalations", response);
        log.info("Escalation created: {} reason={} category={}", saved.getId(), reason, category);

        return response;
    }

    /**
     * Admin xem danh sách escalation đang chờ xử lý.
     */
    @Transactional(readOnly = true)
    public Page<EscalationResponse> getEscalationQueue(EscalationStatus status, Pageable pageable) {
        return escalationRepository.findByStatusOrderByCreatedAtAsc(status, pageable)
                .map(this::toEscalationResponse);
    }

    /**
     * Admin nhận xử lý một escalation.
     */
    @Transactional
    public EscalationResponse assignEscalation(String escalationId, Long adminId) {
        Escalation escalation = escalationRepository.findById(escalationId)
                .orElseThrow(() -> new IllegalArgumentException("Escalation not found: " + escalationId));

        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> new IllegalArgumentException("Admin not found: " + adminId));

        escalation.setAdmin(admin);
        escalation.setStatus(EscalationStatus.ASSIGNED);
        escalation.setAssignedAt(LocalDateTime.now());
        Escalation saved = escalationRepository.save(escalation);

        // Notify khách hàng qua WebSocket
        notifyCustomer(escalation, admin.getFirstName() != null ? admin.getFirstName() : admin.getUsername());

        log.info("Escalation {} assigned to admin {}", escalationId, admin.getUsername());
        return toEscalationResponse(saved);
    }

    /**
     * Admin đóng/resolve một escalation.
     */
    @Transactional
    public EscalationResponse resolveEscalation(String escalationId, Long adminId) {
        Escalation escalation = escalationRepository.findById(escalationId)
                .orElseThrow(() -> new IllegalArgumentException("Escalation not found: " + escalationId));

        escalation.setStatus(EscalationStatus.RESOLVED);
        escalation.setResolvedAt(LocalDateTime.now());
        Escalation saved = escalationRepository.save(escalation);

        // Đếm số escalation đang chờ còn lại → notify admin
        long pendingCount = escalationRepository.countByStatus(EscalationStatus.PENDING);
        messagingTemplate.convertAndSend("/topic/escalations/count", pendingCount);

        log.info("Escalation {} resolved by admin {}", escalationId, adminId);
        return toEscalationResponse(saved);
    }

    /**
     * Đếm escalation đang chờ (cho badge notification admin).
     */
    @Transactional(readOnly = true)
    public long getPendingCount() {
        return escalationRepository.countByStatus(EscalationStatus.PENDING);
    }

    // ── Private Helpers ──────────────────────────────────────────────────────

    /** Phát hiện category dựa trên nội dung chat */
    private EscalationCategory detectCategory(String sessionId, String lastMessage) {
        List<String> recentContents = chatMessageRepository
                .findBySessionIdOrderByCreatedAtAsc(sessionId)
                .stream()
                .map(ChatMessage::getContent)
                .map(String::toLowerCase)
                .collect(Collectors.toList());

        String allText = String.join(" ", recentContents)
                + (lastMessage != null ? " " + lastMessage.toLowerCase() : "");

        if (allText.contains("khiếu nại") || allText.contains("phàn nàn") ||
            allText.contains("tệ") || allText.contains("thất vọng") || allText.contains("bực")) {
            return EscalationCategory.COMPLAINT;
        }
        if (allText.contains("đơn hàng") || allText.contains("order") || allText.contains("đơn #")) {
            return EscalationCategory.ORDER_INQUIRY;
        }
        if (allText.contains("thanh toán") || allText.contains("payment") || allText.contains("vnpay")) {
            return EscalationCategory.PAYMENT;
        }
        if (allText.contains("giao hàng") || allText.contains("ship") || allText.contains("vận chuyển")) {
            return EscalationCategory.SHIPPING;
        }
        if (allText.contains("admin") || allText.contains("người thật") || allText.contains("nhân viên")) {
            return EscalationCategory.ADMIN_REQUEST;
        }
        if (allText.contains("sách") || allText.contains("truyện") || allText.contains("gợi ý")) {
            return EscalationCategory.PRODUCT_ADVICE;
        }
        return EscalationCategory.OTHER;
    }

    /** Xác định priority dựa trên category và reason */
    private EscalationPriority detectPriority(EscalationCategory category, EscalationReason reason) {
        if (category == EscalationCategory.COMPLAINT) return EscalationPriority.HIGH;
        if (category == EscalationCategory.PAYMENT) return EscalationPriority.HIGH;
        if (reason == EscalationReason.USER_REQUEST) return EscalationPriority.MEDIUM;
        return EscalationPriority.LOW;
    }

    /** Tóm tắt đơn giản dựa trên lịch sử chat (Phase 1 — không cần Gemini) */
    private String buildSimpleSummary(String sessionId, String lastMessage) {
        List<ChatMessage> msgs = chatMessageRepository.findBySessionIdOrderByCreatedAtAsc(sessionId);
        long userMsgCount = msgs.stream().filter(m -> m.getRole() == ChatMessage.MessageRole.USER).count();

        StringBuilder sb = new StringBuilder();
        sb.append("Hội thoại gồm ").append(userMsgCount).append(" lượt hỏi từ khách.\n");

        // Lấy 3 tin nhắn user gần nhất
        List<String> recentUserMsgs = msgs.stream()
                .filter(m -> m.getRole() == ChatMessage.MessageRole.USER)
                .skip(Math.max(0, userMsgCount - 3))
                .map(ChatMessage::getContent)
                .collect(Collectors.toList());

        if (!recentUserMsgs.isEmpty()) {
            sb.append("Các câu hỏi gần nhất:\n");
            recentUserMsgs.forEach(m -> sb.append("- ").append(m).append("\n"));
        }

        if (lastMessage != null && !lastMessage.isBlank()) {
            sb.append("Tin nhắn cuối: ").append(lastMessage);
        }

        return sb.toString();
    }

    private void saveEscalationSystemMessage(ChatbotSession session, String escalationId) {
        ChatMessage sysMsg = ChatMessage.builder()
                .fromUser(null)
                .toUser(session.getUser())
                .content("✅ Yêu cầu hỗ trợ của bạn đã được ghi nhận!\n" +
                         "Mã yêu cầu: #" + escalationId.substring(0, 8).toUpperCase() + "\n" +
                         "Admin sẽ tiếp quản cuộc trò chuyện này sớm nhất có thể. Xin bạn chờ một chút! 🙏")
                .sessionId(session.getId())
                .role(ChatMessage.MessageRole.SYSTEM)
                .contentType(ChatMessage.ContentType.SYSTEM_NOTICE)
                .aiConfidence(1.0)
                .isRead(false)
                .build();
        chatMessageRepository.save(sysMsg);
    }

    private void notifyCustomer(Escalation escalation, String adminName) {
        String sessionId = escalation.getSession().getId();
        // Lưu system message thông báo khách
        ChatMessage noticeMsg = ChatMessage.builder()
                .fromUser(null)
                .toUser(escalation.getUser())
                .content("👋 Admin " + adminName + " đang hỗ trợ bạn!")
                .sessionId(sessionId)
                .role(ChatMessage.MessageRole.SYSTEM)
                .contentType(ChatMessage.ContentType.SYSTEM_NOTICE)
                .aiConfidence(1.0)
                .isRead(false)
                .build();
        chatMessageRepository.save(noticeMsg);

        // Notify khách qua WebSocket (nếu đã đăng nhập)
        if (escalation.getUser() != null) {
            messagingTemplate.convertAndSendToUser(
                escalation.getUser().getEmail(),
                "/queue/escalation-status",
                toEscalationResponse(escalation)
            );
        }
    }

    private EscalationResponse toEscalationResponse(Escalation e) {
        User user = e.getUser();
        User admin = e.getAdmin();

        List<ChatMessage> msgs = chatMessageRepository
                .findBySessionIdOrderByCreatedAtAsc(e.getSession().getId());

        String lastMsgPreview = msgs.isEmpty() ? "" :
                msgs.get(msgs.size() - 1).getContent();
        if (lastMsgPreview.length() > 80) lastMsgPreview = lastMsgPreview.substring(0, 80) + "...";

        return EscalationResponse.builder()
                .id(e.getId())
                .sessionId(e.getSession().getId())
                .reason(e.getReason().name())
                .category(e.getCategory().name())
                .priority(e.getPriority().name())
                .status(e.getStatus().name())
                .userId(user != null ? user.getId() : null)
                .username(user != null ? user.getUsername() : "Guest")
                .userEmail(user != null ? user.getEmail() : null)
                .adminId(admin != null ? admin.getId() : null)
                .adminName(admin != null ? (admin.getFirstName() != null ? admin.getFirstName() : admin.getUsername()) : null)
                .aiSummary(e.getAiSummary())
                .aiSuggestion(e.getAiSuggestion())
                .createdAt(e.getCreatedAt())
                .assignedAt(e.getAssignedAt())
                .resolvedAt(e.getResolvedAt())
                .messageCount(msgs.size())
                .lastMessagePreview(lastMsgPreview)
                .build();
    }
}
