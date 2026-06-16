package com.example.bookland_be.dto.request;

import lombok.*;

/**
 * Request tạo escalation (chuyển tiếp sang admin).
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateEscalationRequest {
    private String sessionId;           // UUID của chatbot session
    private String reason;              // Lý do: USER_REQUEST, LOW_CONFIDENCE, COMPLAINT, ...
    private String message;             // Tin nhắn tùy chọn của khách (có thể null)
}
