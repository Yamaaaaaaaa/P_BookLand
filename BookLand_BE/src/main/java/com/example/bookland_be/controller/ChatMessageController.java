package com.example.bookland_be.controller;

import com.example.bookland_be.dto.request.SendChatMessageRequest;
import com.example.bookland_be.dto.response.ApiResponse;
import com.example.bookland_be.dto.response.ChatMessageResponse;
import com.example.bookland_be.dto.response.ConversationUserResponse;
import com.example.bookland_be.entity.User;
import com.example.bookland_be.exception.AppException;
import com.example.bookland_be.exception.ErrorCode;
import com.example.bookland_be.repository.UserRepository;
import com.example.bookland_be.service.ChatMessageService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/chat")
@RequiredArgsConstructor
@SecurityRequirement(name = "BearerAuth")
public class ChatMessageController {

    private final ChatMessageService chatMessageService;
    private final UserRepository userRepository;

    @GetMapping("/history/{otherUserId}")
    public ApiResponse<List<ChatMessageResponse>> getChatHistory(@PathVariable Long otherUserId) {
        Long currentUserId = getCurrentUserId();
        return ApiResponse.<List<ChatMessageResponse>>builder()
                .result(chatMessageService.getChatHistory(currentUserId, otherUserId))
                .build();
    }

    @GetMapping("/conversations")
    public ApiResponse<List<ConversationUserResponse>> getConversations() {
        Long currentUserId = getCurrentUserId();
        return ApiResponse.<List<ConversationUserResponse>>builder()
                .result(chatMessageService.getConversations(currentUserId))
                .build();
    }

    @PostMapping("/send")
    public ApiResponse<ChatMessageResponse> sendMessage(@RequestBody SendChatMessageRequest request) {
        Long currentUserId = getCurrentUserId();
        return ApiResponse.<ChatMessageResponse>builder()
                .result(chatMessageService.sendMessage(currentUserId, request))
                .build();
    }

    @PutMapping("/mark-read/{otherUserId}")
    public ApiResponse<Void> markAsRead(@PathVariable Long otherUserId) {
        Long currentUserId = getCurrentUserId();
        chatMessageService.markAsRead(currentUserId, otherUserId);
        return ApiResponse.<Void>builder()
                .message("Messages marked as read")
                .build();
    }

    @GetMapping("/unread-count")
    public ApiResponse<Long> getUnreadCount() {
        Long currentUserId = getCurrentUserId();
        return ApiResponse.<Long>builder()
                .result(chatMessageService.getUnreadCount(currentUserId))
                .build();
    }

    private Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        return user.getId();
    }
}
