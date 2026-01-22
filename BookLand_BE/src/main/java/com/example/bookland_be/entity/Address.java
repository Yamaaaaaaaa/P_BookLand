package com.example.bookland_be.entity;
import lombok.*;
import jakarta.persistence.*;

@Entity
@Table(name = "address")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Address {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "userId", nullable = false)
    private User user;

    @Column(length = 50)
    private String contactPhone;

    @Column(columnDefinition = "TEXT")
    private String addressDetail;

    @Builder.Default
    private Boolean isDefault = false;
}