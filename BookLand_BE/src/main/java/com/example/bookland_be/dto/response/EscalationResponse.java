package com.example.bookland_be.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;
import java.time.LocalDateTime;

/**
 * Response cho escalation — dùng cho cả khách hàng và admin.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class EscalationResponse {
    private String id;
    private String sessionId;
    private String reason;
    private String category;
    private String priority;
    private String status;

    // Thông tin user (nếu có)
    private Long userId;
    private String username;
    private String userEmail;

    // Thông tin admin được gán
    private Long adminId;
    private String adminName;

    // AI-generated content (chỉ admin thấy)
    private String aiSummary;
    private String aiSuggestion;

    private LocalDateTime createdAt;
    private LocalDateTime assignedAt;
    private LocalDateTime resolvedAt;

    // Số tin nhắn trong session (cho admin hiển thị preview)
    private Integer messageCount;
    // Tin nhắn cuối cùng (preview)
    private String lastMessagePreview;
}
