package com.example.bookland_be.entity;

import lombok.*;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "chatbot_knowledge")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatbotKnowledge {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private KnowledgeCategory category;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String content;

    @Column(length = 500)
    private String keywords;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    @Column(nullable = false)
    @Builder.Default
    private Integer priority = 0;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public enum KnowledgeCategory {
        POLICY_RETURN,    // Chính sách đổi trả
        POLICY_SHIPPING,  // Chính sách giao hàng
        POLICY_PAYMENT,   // Chính sách thanh toán
        FAQ_ORDER,        // FAQ đặt hàng
        FAQ_ACCOUNT,      // FAQ tài khoản
        PROMOTION,        // Khuyến mãi
        ABOUT             // Thông tin cửa hàng
    }
}
