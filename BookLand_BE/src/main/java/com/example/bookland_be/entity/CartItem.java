package com.example.bookland_be.entity;


import lombok.*;
import jakarta.persistence.*;
import java.io.Serializable;

@Entity
@Table(name = "cart_item")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@IdClass(CartItem.CartItemId.class)
public class CartItem {

    @Id
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cartId")
    private Cart cart;

    @Id
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "bookId")
    private Book book;

    @Column(nullable = false)
    @Builder.Default
    private Integer quantity = 1;

    // Composite Key Class
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CartItemId implements Serializable {
        private Long cart;
        private Long book;
    }
}