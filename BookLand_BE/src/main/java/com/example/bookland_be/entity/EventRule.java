package com.example.bookland_be.entity;


import lombok.*;
import jakarta.persistence.*;

@Entity
@Table(name = "event_rule")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EventRule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "eventId", nullable = false)
    private Event event;

    @Column(nullable = false)
    private String ruleType; // MIN_QUANTITY, MIN_ORDER_VALUE, MAX_USAGE, etc.

    @Column(nullable = false)
    private String ruleValue;
}