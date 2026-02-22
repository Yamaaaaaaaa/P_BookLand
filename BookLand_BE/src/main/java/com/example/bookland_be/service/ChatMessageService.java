package com.example.bookland_be.service;

import com.example.bookland_be.dto.request.SendChatMessageRequest;
import com.example.bookland_be.dto.response.ChatMessageResponse;
import com.example.bookland_be.dto.response.ConversationUserResponse;
import com.example.bookland_be.entity.ChatMessage;
import com.example.bookland_be.entity.User;
import com.example.bookland_be.exception.AppException;
import com.example.bookland_be.exception.ErrorCode;
import com.example.bookland_be.repository.ChatMessageRepository;
import com.example.bookland_be.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ChatMessageService {

    private final ChatMessageRepository chatMessageRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @Transactional(readOnly = true)
    public List<ChatMessageResponse> getChatHistory(Long currentUserId, Long otherUserId) {
        return chatMessageRepository.findChatHistory(currentUserId, otherUserId)
                .stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ConversationUserResponse> getConversations(Long adminId) {
        List<Long> userIds = chatMessageRepository.findConversationUserIds(adminId);
        List<ConversationUserResponse> conversations = new ArrayList<>();

        for (Long userId : userIds) {
            User user = userRepository.findById(userId).orElse(null);
            if (user != null) {
                Long unreadCount = chatMessageRepository.countUnreadMessagesBetween(userId, adminId);
                
                List<ChatMessage> history = chatMessageRepository.findChatHistory(adminId, userId);
                ChatMessageResponse lastMessage = history.isEmpty() ? null : convertToResponse(history.get(history.size() - 1));

                conversations.add(ConversationUserResponse.builder()
                        .userId(user.getId())
                        .username(user.getUsername())
                        .email(user.getEmail())
                        .unreadCount(unreadCount)
                        .lastMessage(lastMessage)
                        .build());
            }
        }

        return conversations;
    }

    @Transactional
    public ChatMessageResponse sendMessage(Long fromUserId, SendChatMessageRequest request) {
        User fromUser = userRepository.findById(fromUserId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        User toUser = userRepository.findByEmail(request.getToEmail())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        ChatMessage chatMessage = ChatMessage.builder()
                .fromUser(fromUser)
                .toUser(toUser)
                .content(request.getContent())
                .isRead(false)
                .build();

        ChatMessage saved = chatMessageRepository.save(chatMessage);
        ChatMessageResponse response = convertToResponse(saved);

        // Send WebSocket message to recipient
        log.info("Sending WebSocket chat message from {} to {}", fromUser.getEmail(), toUser.getEmail());
        messagingTemplate.convertAndSendToUser(
                toUser.getEmail(),
                "/queue/chat",
                response
        );

        return response;
    }

    @Transactional
    public void markAsRead(Long currentUserId, Long otherUserId) {
        List<ChatMessage> messages = chatMessageRepository.findChatHistory(currentUserId, otherUserId);
        messages.stream()
                .filter(msg -> msg.getToUser().getId().equals(currentUserId) && !msg.getIsRead())
                .forEach(msg -> msg.setIsRead(true));
        chatMessageRepository.saveAll(messages);
    }

    @Transactional(readOnly = true)
    public Long getUnreadCount(Long userId) {
        return chatMessageRepository.countUnreadMessages(userId);
    }

    private ChatMessageResponse convertToResponse(ChatMessage message) {
        return ChatMessageResponse.builder()
                .id(message.getId())
                .fromUserId(message.getFromUser().getId())
                .fromUsername(message.getFromUser().getUsername())
                .fromEmail(message.getFromUser().getEmail())
                .toUserId(message.getToUser().getId())
                .toUsername(message.getToUser().getUsername())
                .toEmail(message.getToUser().getEmail())
                .content(message.getContent())
                .isRead(message.getIsRead())
                .createdAt(message.getCreatedAt())
                .build();
    }
}
