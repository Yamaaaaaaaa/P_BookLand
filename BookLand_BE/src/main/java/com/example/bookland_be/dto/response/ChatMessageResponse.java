package com.example.bookland_be.dto.response;

import lombok.*;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessageResponse {
    private Long id;
    private Long fromUserId;
    private String fromUsername;
    private String fromEmail;
    private Long toUserId;
    private String toUsername;
    private String toEmail;
    private String content;
    private Boolean isRead;
    private LocalDateTime createdAt;
}
