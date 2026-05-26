package com.example.bookland_be.controller;

import com.example.bookland_be.dto.request.CreateChatbotSessionRequest;
import com.example.bookland_be.dto.request.SendChatbotMessageRequest;
import com.example.bookland_be.dto.request.CreateEscalationRequest;
import com.example.bookland_be.dto.response.ApiResponse;
import com.example.bookland_be.dto.response.ChatbotMessageResponse;
import com.example.bookland_be.dto.response.ChatbotMessageResponse.ChatMessageDTO;
import com.example.bookland_be.dto.response.ChatbotSessionResponse;
import com.example.bookland_be.dto.response.EscalationResponse;
import com.example.bookland_be.entity.User;
import com.example.bookland_be.repository.UserRepository;
import com.example.bookland_be.service.ChatbotService;
import com.example.bookland_be.service.EscalationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import com.example.bookland_be.entity.Escalation.EscalationStatus;

import java.util.List;
import java.util.Optional;

/**
 * ChatbotController — Xử lý chatbot API.
 *
 * Auth strategy:
 * - Các endpoint /chatbot/** là PUBLIC (khai báo trong SecurityConfig)
 * - User đã đăng nhập → lấy userId từ JWT token
 * - Guest → lấy guestToken từ header X-Guest-Token
 */
@RestController
@RequestMapping("/chatbot")
@RequiredArgsConstructor
@Slf4j
public class ChatbotController {

    private final ChatbotService chatbotService;
    private final EscalationService escalationService;
    private final UserRepository userRepository;

    // ── Session ─────────────────────────────────────────────────────────────

    /**
     * POST /chatbot/sessions
     * Tạo hoặc resume chatbot session.
     * Public — không yêu cầu auth.
     */
    @PostMapping("/sessions")
    public ApiResponse<ChatbotSessionResponse> createOrResumeSession(
            @RequestBody(required = false) CreateChatbotSessionRequest request,
            @RequestHeader(value = "X-Guest-Token", required = false) String guestTokenHeader) {

        if (request == null) request = new CreateChatbotSessionRequest();
        // Ưu tiên header, fallback sang body
        if (request.getGuestToken() == null && guestTokenHeader != null) {
            request.setGuestToken(guestTokenHeader);
        }

        Long currentUserId = getCurrentUserIdOptional();
        ChatbotSessionResponse response = chatbotService.createOrResumeSession(request, currentUserId);
        return ApiResponse.<ChatbotSessionResponse>builder().result(response).build();
    }

    /**
     * POST /chatbot/sessions/{sessionId}/messages
     * Gửi tin nhắn và nhận phản hồi bot.
     * Public — không yêu cầu auth.
     */
    @PostMapping("/sessions/{sessionId}/messages")
    public ApiResponse<ChatbotMessageResponse> sendMessage(
            @PathVariable String sessionId,
            @RequestBody SendChatbotMessageRequest request,
            @RequestHeader(value = "X-Guest-Token", required = false) String guestToken) {

        Long currentUserId = getCurrentUserIdOptional();
        ChatbotMessageResponse response = chatbotService.processMessage(sessionId, request, currentUserId, guestToken);
        return ApiResponse.<ChatbotMessageResponse>builder().result(response).build();
    }

    /**
     * GET /chatbot/sessions/{sessionId}/messages
     * Lấy lịch sử chat của session.
     * Public — không yêu cầu auth.
     */
    @GetMapping("/sessions/{sessionId}/messages")
    public ApiResponse<List<ChatMessageDTO>> getSessionHistory(
            @PathVariable String sessionId,
            @RequestHeader(value = "X-Guest-Token", required = false) String guestToken) {

        Long currentUserId = getCurrentUserIdOptional();
        List<ChatMessageDTO> history = chatbotService.getSessionHistory(sessionId, currentUserId, guestToken);
        return ApiResponse.<List<ChatMessageDTO>>builder().result(history).build();
    }

    /**
     * DELETE /chatbot/sessions/{sessionId}
     * Đóng chatbot session.
     * Public — không yêu cầu auth.
     */
    @DeleteMapping("/sessions/{sessionId}")
    public ApiResponse<Void> closeSession(
            @PathVariable String sessionId,
            @RequestHeader(value = "X-Guest-Token", required = false) String guestToken) {

        Long currentUserId = getCurrentUserIdOptional();
        chatbotService.closeSession(sessionId, currentUserId, guestToken);
        return ApiResponse.<Void>builder().message("Session closed").build();
    }

    // ── Escalation ──────────────────────────────────────────────────────────

    /**
     * POST /chatbot/escalations
     * Tạo yêu cầu chuyển tiếp sang admin.
     * Public — không yêu cầu auth.
     */
    @PostMapping("/escalations")
    public ApiResponse<EscalationResponse> createEscalation(
            @RequestBody CreateEscalationRequest request,
            @RequestHeader(value = "X-Guest-Token", required = false) String guestToken) {

        Long currentUserId = getCurrentUserIdOptional();
        EscalationResponse response = escalationService.createEscalation(request, currentUserId, guestToken);
        return ApiResponse.<EscalationResponse>builder().result(response).build();
    }

    /**
     * GET /chatbot/escalations
     * Admin xem queue escalation đang chờ.
     * Requires: ROLE_ADMIN | ROLE_SERVICE_SUPPORTER
     */
    @GetMapping("/escalations")
    @org.springframework.security.access.prepost.PreAuthorize(
        "hasAnyRole('ROLE_ADMIN', 'ROLE_SERVICE_SUPPORTER', 'ROLE_MANAGER')")
    public ApiResponse<Page<EscalationResponse>> getEscalationQueue(
            @RequestParam(defaultValue = "PENDING") String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        EscalationStatus escalationStatus;
        try {
            escalationStatus = EscalationStatus.valueOf(status.toUpperCase());
        } catch (Exception e) {
            escalationStatus = EscalationStatus.PENDING;
        }
        Page<EscalationResponse> result = escalationService.getEscalationQueue(
                escalationStatus, PageRequest.of(page, size));
        return ApiResponse.<Page<EscalationResponse>>builder().result(result).build();
    }

    /**
     * PATCH /chatbot/escalations/{id}/assign
     * Admin nhận xử lý escalation.
     */
    @PatchMapping("/escalations/{id}/assign")
    @org.springframework.security.access.prepost.PreAuthorize(
        "hasAnyRole('ROLE_ADMIN', 'ROLE_SERVICE_SUPPORTER', 'ROLE_MANAGER')")
    public ApiResponse<EscalationResponse> assignEscalation(@PathVariable String id) {
        Long adminId = getCurrentUserIdRequired();
        EscalationResponse response = escalationService.assignEscalation(id, adminId);
        return ApiResponse.<EscalationResponse>builder().result(response).build();
    }

    /**
     * PATCH /chatbot/escalations/{id}/resolve
     * Admin đóng escalation sau khi xử lý xong.
     */
    @PatchMapping("/escalations/{id}/resolve")
    @org.springframework.security.access.prepost.PreAuthorize(
        "hasAnyRole('ROLE_ADMIN', 'ROLE_SERVICE_SUPPORTER', 'ROLE_MANAGER')")
    public ApiResponse<EscalationResponse> resolveEscalation(@PathVariable String id) {
        Long adminId = getCurrentUserIdRequired();
        EscalationResponse response = escalationService.resolveEscalation(id, adminId);
        return ApiResponse.<EscalationResponse>builder().result(response).build();
    }

    /**
     * GET /chatbot/escalations/count
     * Đếm số escalation đang chờ (cho badge admin).
     */
    @GetMapping("/escalations/count")
    @org.springframework.security.access.prepost.PreAuthorize(
        "hasAnyRole('ROLE_ADMIN', 'ROLE_SERVICE_SUPPORTER', 'ROLE_MANAGER')")
    public ApiResponse<Long> getPendingEscalationCount() {
        return ApiResponse.<Long>builder().result(escalationService.getPendingCount()).build();
    }

    // ── Helper ──────────────────────────────────────────────────────────────

    /** Lấy userId nếu đã đăng nhập, trả về null nếu là guest */
    private Long getCurrentUserIdOptional() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
                return null;
            }
            String email = auth.getName();
            return userRepository.findByEmail(email).map(User::getId).orElse(null);
        } catch (Exception e) {
            return null;
        }
    }

    /** Lấy userId — ném exception nếu chưa đăng nhập */
    private Long getCurrentUserIdRequired() {
        Long userId = getCurrentUserIdOptional();
        if (userId == null) throw new SecurityException("Authentication required");
        return userId;
    }
}
