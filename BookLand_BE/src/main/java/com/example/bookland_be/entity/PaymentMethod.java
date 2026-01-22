package com.example.bookland_be.entity;


import lombok.*;
import jakarta.persistence.*;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "payment_method")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentMethod {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String providerCode;

    @Builder.Default
    private Boolean isOnline = false;

    @Column(columnDefinition = "TEXT")
    private String description;

    @OneToMany(mappedBy = "paymentMethod", cascade = CascadeType.ALL)
    @Builder.Default
    private Set<Bill> bills = new HashSet<>();

    @OneToMany(mappedBy = "paymentMethod", cascade = CascadeType.ALL)
    @Builder.Default
    private Set<PaymentTransaction> transactions = new HashSet<>();
}