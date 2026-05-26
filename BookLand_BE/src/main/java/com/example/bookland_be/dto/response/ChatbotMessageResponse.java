package com.example.bookland_be.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Response cho một lượt giao tiếp chatbot:
 * bao gồm tin nhắn của user và phản hồi của bot.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ChatbotMessageResponse {

    /** Tin nhắn user vừa gửi (đã được lưu DB) */
    private ChatMessageDTO userMessage;

    /** Phản hồi của bot */
    private ChatMessageDTO botResponse;

    /** Confidence score của bot (0.0 - 1.0) */
    private Double confidence;

    /** Các nút quick reply gợi ý */
    private List<String> quickReplies;

    /** Sách được gợi ý (nếu contentType = PRODUCT_CARD) */
    private List<BookSuggestionDTO> productSuggestions;

    /** Chatbot có đề xuất escalation không */
    private Boolean suggestEscalation;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ChatMessageDTO {
        private Long id;
        private String sessionId;
        private String role;          // USER | ASSISTANT | ADMIN | SYSTEM
        private String contentType;   // TEXT | PRODUCT_CARD | QUICK_REPLY | SYSTEM_NOTICE
        private String content;
        private Double aiConfidence;
        private String metadata;      // JSON string
        private LocalDateTime createdAt;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BookSuggestionDTO {
        private Long id;
        private String name;
        private String bookImageUrl;
        private Double originalCost;
        private Double sale;
        private Double finalPrice;
        private Double averageRating;
        private Integer stock;
        private String reason;       // Lý do bot gợi ý cuốn sách này
    }
}
