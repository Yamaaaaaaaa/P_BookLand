package com.example.bookland_be.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;
import java.time.LocalDateTime;

/**
 * Response cho chatbot session.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ChatbotSessionResponse {
    private String sessionId;
    private String sessionType;   // GUEST | USER
    private String status;        // ACTIVE | ESCALATED | CLOSED
    private LocalDateTime startedAt;
    private LocalDateTime lastActivity;
    private Integer messageCount;
}
