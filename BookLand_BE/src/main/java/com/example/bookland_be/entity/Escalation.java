package com.example.bookland_be.entity;

import lombok.*;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "escalation")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Escalation {

    @Id
    @Column(length = 36)
    private String id; // UUID v4

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_id", nullable = false)
    private ChatbotSession session;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user; // NULL nếu là guest

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "admin_id")
    private User admin; // Admin được gán xử lý

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EscalationReason reason;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private EscalationCategory category = EscalationCategory.OTHER;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private EscalationPriority priority = EscalationPriority.MEDIUM;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private EscalationStatus status = EscalationStatus.PENDING;

    @Column(name = "ai_summary", columnDefinition = "TEXT")
    private String aiSummary; // AI tóm tắt hội thoại cho admin

    @Column(name = "ai_suggestion", columnDefinition = "TEXT")
    private String aiSuggestion; // AI gợi ý câu trả lời cho admin

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "assigned_at")
    private LocalDateTime assignedAt;

    @Column(name = "resolved_at")
    private LocalDateTime resolvedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public enum EscalationReason {
        USER_REQUEST,       // Khách chủ động bấm "Gặp admin"
        LOW_CONFIDENCE,     // Bot confidence < 0.65
        REPEATED_QUESTION,  // Hỏi cùng vấn đề 3+ lần
        COMPLAINT,          // Bot phát hiện tone khiếu nại
        OUT_OF_SCOPE        // Chủ đề ngoài phạm vi bot
    }

    public enum EscalationCategory {
        PRODUCT_ADVICE,   // Tư vấn sản phẩm
        COMPLAINT,        // Khiếu nại
        ORDER_INQUIRY,    // Hỏi đơn hàng
        PAYMENT,          // Thanh toán
        SHIPPING,         // Giao hàng
        ADMIN_REQUEST,    // Khách muốn gặp người thật
        OTHER
    }

    public enum EscalationPriority {
        LOW, MEDIUM, HIGH
    }

    public enum EscalationStatus {
        PENDING,    // Chờ admin nhận
        ASSIGNED,   // Đang được admin xử lý
        RESOLVED,   // Đã giải quyết
        CLOSED      // Đã đóng
    }
}
