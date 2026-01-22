package com.example.bookland_be.entity;
import lombok.*;
import jakarta.persistence.*;

@Entity
@Table(name = "event_action")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EventAction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "eventId", nullable = false)
    private Event event;

    @Column(nullable = false)
    private String actionType; // DISCOUNT_PERCENT, DISCOUNT_AMOUNT, FREE_SHIPPING, etc.

    @Column(nullable = false)
    private String actionValue;
}