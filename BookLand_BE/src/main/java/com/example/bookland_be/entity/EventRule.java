// EventRule.java (Updated)
package com.example.bookland_be.entity;

import com.example.bookland_be.enums.EventRuleType;
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

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EventRuleType ruleType;

    @Column(nullable = false)
    private String ruleValue;
}