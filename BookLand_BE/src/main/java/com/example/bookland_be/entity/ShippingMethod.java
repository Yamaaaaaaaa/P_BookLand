package com.example.bookland_be.entity;


import lombok.*;
import jakarta.persistence.*;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "shipping_method")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ShippingMethod {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    @Builder.Default
    private Double price = (double) 0;

    @OneToMany(mappedBy = "shippingMethod", cascade = CascadeType.ALL)
    @Builder.Default
    private Set<Bill> bills = new HashSet<>();
}
