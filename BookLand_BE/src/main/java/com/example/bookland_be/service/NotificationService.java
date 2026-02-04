package com.example.bookland_be.service;

import com.example.bookland_be.dto.response.NotificationResponse;
import com.example.bookland_be.entity.Notification;
import com.example.bookland_be.entity.Notification.NotificationStatus;
import com.example.bookland_be.entity.User;
import com.example.bookland_be.exception.AppException;
import com.example.bookland_be.exception.ErrorCode;
import com.example.bookland_be.repository.NotificationRepository;
import com.example.bookland_be.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @Transactional(readOnly = true)
    public Page<NotificationResponse> getNotifications(Long userId, Pageable pageable) {
        return notificationRepository.findByToIdOrderByCreatedAtDesc(userId, pageable)
                .map(this::convertToResponse);
    }

    @Transactional(readOnly = true)
    public long countUnread(Long userId) {
        return notificationRepository.countUnreadByUserId(userId);
    }

    @Transactional
    public void markAsRead(Long id) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.BOOK_NOT_FOUND)); // Reuse existing error or create new one
        notification.setStatus(NotificationStatus.READ);
        notification.setReadAt(LocalDateTime.now());
        notificationRepository.save(notification);
    }

    @Transactional
    public void markAllAsRead(Long userId) {
        notificationRepository.markAllAsReadByUserId(userId, LocalDateTime.now());
    }

    @Transactional
    public void deleteNotification(Long id) {
        notificationRepository.deleteById(id);
    }

    @Transactional
    public void deleteAllRead(Long userId) {
        notificationRepository.deleteAllReadByUserId(userId);
    }

    @Transactional
    public NotificationResponse createNotification(Long toUserId, String type, String title, String content, Long fromUserId) {
        User toUser = userRepository.findById(toUserId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        User fromUser = null;
        if (fromUserId != null) {
            fromUser = userRepository.findById(fromUserId).orElse(null);
        }

        Notification notification = Notification.builder()
                .to(toUser)
                .from(fromUser)
                .type(type)
                .title(title)
                .content(content)
                .status(NotificationStatus.UNREAD)
                .build();

        Notification saved = notificationRepository.save(notification);
        NotificationResponse response = convertToResponse(saved);

        // Send WebSocket notification
        messagingTemplate.convertAndSendToUser(
                toUser.getUsername(),
                "/queue/notifications",
                response
        );

        return response;
    }

    private NotificationResponse convertToResponse(Notification notification) {
        return NotificationResponse.builder()
                .id(notification.getId())
                .fromUserId(notification.getFrom() != null ? notification.getFrom().getId() : null)
                .fromUsername(notification.getFrom() != null ? notification.getFrom().getUsername() : null)
                .toUserId(notification.getTo().getId())
                .toUsername(notification.getTo().getUsername())
                .type(notification.getType())
                .title(notification.getTitle())
                .content(notification.getContent())
                .status(notification.getStatus())
                .readAt(notification.getReadAt())
                .createdAt(notification.getCreatedAt())
                .build();
    }
}
