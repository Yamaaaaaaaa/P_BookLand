package com.example.bookland_be.entity;

import lombok.*;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "ai_feedback")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AiFeedback {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "message_id", nullable = false)
    private Long messageId; // ID của chat_message (role=assistant)

    @Column(name = "session_id", nullable = false, length = 36)
    private String sessionId;

    @Enumerated(EnumType.STRING)
    @Column(name = "feedback_type", nullable = false)
    private FeedbackType feedbackType;

    @Column(columnDefinition = "TEXT")
    private String comment;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public enum FeedbackType {
        THUMBS_UP,    // 👍
        THUMBS_DOWN,  // 👎
        FLAGGED       // Báo cáo nội dung không phù hợp
    }
}
