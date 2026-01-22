package com.example.bookland_be.entity;


import lombok.*;
import jakarta.persistence.*;
import java.io.Serializable;

@Entity
@Table(name = "purchase_invoice_book")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@IdClass(PurchaseInvoiceBook.PurchaseInvoiceBookId.class)
public class PurchaseInvoiceBook {

    @Id
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "purchaseInvoiceId")
    private PurchaseInvoice purchaseInvoice;

    @Id
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "bookId")
    private Book book;

    @Column(nullable = false)
    private Integer quantity;

    @Column(nullable = false)
    private Double importPrice;

    // Composite Key Class
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PurchaseInvoiceBookId implements Serializable {
        private Long purchaseInvoice;
        private Long book;
    }
}
