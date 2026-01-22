package com.example.bookland_be.repository;

import com.example.bookland_be.entity.PurchaseInvoiceBook;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PurchaseInvoiceBookRepository extends JpaRepository<PurchaseInvoiceBook, PurchaseInvoiceBook.PurchaseInvoiceBookId> {

    List<PurchaseInvoiceBook> findByPurchaseInvoiceId(Long purchaseInvoiceId);

    @Query("SELECT pib FROM PurchaseInvoiceBook pib " +
            "LEFT JOIN FETCH pib.book " +
            "WHERE pib.purchaseInvoice.id = :invoiceId")
    List<PurchaseInvoiceBook> findByPurchaseInvoiceIdWithBook(@Param("invoiceId") Long invoiceId);

    @Query("SELECT SUM(pib.quantity) FROM PurchaseInvoiceBook pib WHERE pib.book.id = :bookId")
    Long getTotalQuantityImportedByBookId(@Param("bookId") Long bookId);
}