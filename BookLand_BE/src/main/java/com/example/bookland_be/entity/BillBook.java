package com.example.bookland_be.entity;


import lombok.*;
import jakarta.persistence.*;
import java.io.Serializable;

@Entity
@Table(name = "bill_book")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@IdClass(BillBook.BillBookId.class)
public class BillBook {

    @Id
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "billId")
    private Bill bill;

    @Id
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "bookId")
    private Book book;

    @Column(nullable = false)
    private Double priceSnapshot;

    @Column(nullable = false)
    private Integer quantity;

    // Composite Key Class
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BillBookId implements Serializable {
        private Long bill;
        private Long book;
    }
}