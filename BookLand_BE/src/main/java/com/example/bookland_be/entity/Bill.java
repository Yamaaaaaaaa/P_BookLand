package com.example.bookland_be.entity;


import lombok.*;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "bill")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Bill {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "userId", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "paymentMethodId", nullable = false)
    private PaymentMethod paymentMethod;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "shippingMethodId", nullable = false)
    private ShippingMethod shippingMethod;

    @Column(nullable = false)
    private Double totalCost;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "approvedId")
    private User approvedBy;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private BillStatus status = BillStatus.PENDING;

    @Column(columnDefinition = "VARCHAR(20) DEFAULT 'PENDING'")
    @Builder.Default
    private String paymentStatus = "PENDING";

    @Column(updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    private LocalDateTime approvedAt;

    @OneToMany(mappedBy = "bill", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private Set<BillBook> billBooks = new HashSet<>();

    @OneToMany(mappedBy = "bill", cascade = CascadeType.ALL)
    @Builder.Default
    private Set<PaymentTransaction> transactions = new HashSet<>();

    @OneToMany(mappedBy = "bill", cascade = CascadeType.ALL)
    @Builder.Default
    private Set<EventLog> eventLogs = new HashSet<>();

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public enum BillStatus {
        PENDING, APPROVED, SHIPPING, SHIPPED, COMPLETED, CANCELED
    }
}