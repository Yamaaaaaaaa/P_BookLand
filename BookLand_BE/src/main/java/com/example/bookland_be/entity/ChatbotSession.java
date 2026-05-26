package com.example.bookland_be.entity;

import lombok.*;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "chatbot_session")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatbotSession {

    @Id
    @Column(length = 36)
    private String id; // UUID v4

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user; // NULL nếu là guest

    @Column(name = "guest_token", length = 64)
    private String guestToken; // UUID lưu ở localStorage của guest

    @Enumerated(EnumType.STRING)
    @Column(name = "session_type", nullable = false)
    private SessionType sessionType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private SessionStatus status = SessionStatus.ACTIVE;

    @Column(name = "started_at", nullable = false, updatable = false)
    private LocalDateTime startedAt;

    @Column(name = "last_activity", nullable = false)
    private LocalDateTime lastActivity;

    @Column(name = "closed_at")
    private LocalDateTime closedAt;

    @Column(name = "message_count", nullable = false)
    @Builder.Default
    private Integer messageCount = 0;

    @OneToMany(mappedBy = "session", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private Set<Escalation> escalations = new HashSet<>();

    @PrePersist
    protected void onCreate() {
        startedAt = LocalDateTime.now();
        lastActivity = LocalDateTime.now();
    }

    public enum SessionType {
        GUEST, USER
    }

    public enum SessionStatus {
        ACTIVE, ESCALATED, CLOSED
    }
}
