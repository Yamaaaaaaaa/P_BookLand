package com.example.bookland_be.dto.response;

import com.example.bookland_be.entity.Notification.NotificationStatus;
import lombok.*;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationResponse {
    private Long id;
    private Long fromUserId;
    private String fromUsername;
    private Long toUserId;
    private String toUsername;
    private String type;
    private String title;
    private String content;
    private NotificationStatus status;
    private LocalDateTime readAt;
    private LocalDateTime createdAt;
}
