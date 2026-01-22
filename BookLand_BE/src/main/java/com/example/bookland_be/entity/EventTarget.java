package com.example.bookland_be.entity;

import lombok.*;
import jakarta.persistence.*;

@Entity
@Table(name = "event_target")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EventTarget {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "eventId", nullable = false)
    private Event event;

    @Column(nullable = false)
    private String targetType; // BOOK, CATEGORY, SERIES, AUTHOR, etc.

    @Column(nullable = false)
    private Long targetId;
}
