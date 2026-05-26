package com.example.bookland_be.dto.request;

import lombok.*;

/**
 * Request gửi tin nhắn trong chatbot session.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SendChatbotMessageRequest {
    private String content; // Nội dung tin nhắn của khách
}
