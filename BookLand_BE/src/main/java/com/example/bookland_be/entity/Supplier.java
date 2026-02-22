package com.example.bookland_be.entity;


import lombok.*;
import jakarta.persistence.*;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "supplier")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Supplier {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(length = 50)
    private String phone;

    private String email;

    private String address;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private SupplierStatus status = SupplierStatus.ACTIVE;

    @OneToMany(mappedBy = "supplier", cascade = CascadeType.ALL)
    @Builder.Default
    private Set<PurchaseInvoice> purchaseInvoices = new HashSet<>();

    public enum SupplierStatus {
        ACTIVE, INACTIVE
    }
}