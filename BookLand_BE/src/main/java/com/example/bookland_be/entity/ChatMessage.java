package com.example.bookland_be.entity;

import lombok.*;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "chat_message")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // nullable = false kế thừa từ trước; chatbot reply sẽ có fromUser = null
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "from_user_id", nullable = true)
    private User fromUser;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "to_user_id", nullable = true)
    private User toUser;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String content;

    @Column(nullable = false)
    @Builder.Default
    private Boolean isRead = false;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    // ── Chatbot fields (thêm mới) ─────────────────────────────────────────────

    /** UUID của chatbot session. NULL = chat admin thông thường */
    @Column(name = "session_id", length = 36)
    private String sessionId;

    /** Ai gửi tin nhắn này */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private MessageRole role = MessageRole.USER;

    /** Kiểu nội dung tin nhắn */
    @Enumerated(EnumType.STRING)
    @Column(name = "content_type", nullable = false)
    @Builder.Default
    private ContentType contentType = ContentType.TEXT;

    /** Confidence score của bot (0.00 - 1.00). NULL nếu không phải bot reply */
    @Column(name = "ai_confidence")
    private Double aiConfidence;

    /**
     * JSON metadata tùy theo contentType:
     * - product_card: {"product_ids": [1,2,3]}
     * - quick_reply:  {"options": ["Xem thêm", "Mua ngay"]}
     */
    @Column(columnDefinition = "JSON")
    private String metadata;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public enum MessageRole {
        USER,       // Khách hàng gửi
        ASSISTANT,  // Bot trả lời
        ADMIN,      // Admin gửi (trong cuộc trò chuyện escalated)
        SYSTEM      // Thông báo hệ thống (vd: "Admin X đã tham gia")
    }

    public enum ContentType {
        TEXT,           // Tin nhắn văn bản thông thường
        PRODUCT_CARD,   // Card gợi ý sản phẩm (kèm metadata product_ids)
        QUICK_REPLY,    // Nút quick reply (kèm metadata options)
        SYSTEM_NOTICE   // Thông báo hệ thống
    }
}
