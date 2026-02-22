package com.example.bookland_be.repository;

import com.example.bookland_be.entity.PurchaseInvoice;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface PurchaseInvoiceRepository extends JpaRepository<PurchaseInvoice, Long> {

    List<PurchaseInvoice> findBySupplierId(Long supplierId);

    Page<PurchaseInvoice> findBySupplierId(Long supplierId, Pageable pageable);

    List<PurchaseInvoice> findByStatus(PurchaseInvoice.PurchaseStatus status);

    Page<PurchaseInvoice> findByStatus(PurchaseInvoice.PurchaseStatus status, Pageable pageable);

    @Query("SELECT pi FROM PurchaseInvoice pi " +
            "LEFT JOIN FETCH pi.purchaseInvoiceBooks pib " +
            "LEFT JOIN FETCH pib.book " +
            "WHERE pi.id = :id")
    Optional<PurchaseInvoice> findByIdWithBooks(@Param("id") Long id);

    @Query("SELECT pi FROM PurchaseInvoice pi " +
            "LEFT JOIN FETCH pi.supplier " +
            "LEFT JOIN FETCH pi.creator " +
            "WHERE pi.id = :id")
    Optional<PurchaseInvoice> findByIdWithDetails(@Param("id") Long id);

    @Query("SELECT pi FROM PurchaseInvoice pi WHERE pi.createdAt BETWEEN :startDate AND :endDate")
    List<PurchaseInvoice> findByDateRange(@Param("startDate") LocalDateTime startDate,
                                          @Param("endDate") LocalDateTime endDate);

    @Query("SELECT SUM(pi.totalCost) FROM PurchaseInvoice pi WHERE pi.status = 'COMPLETED'")
    Long getTotalPurchaseCost();

    @Query("SELECT SUM(pi.totalCost) FROM PurchaseInvoice pi " +
            "WHERE pi.status = 'COMPLETED' AND pi.createdAt BETWEEN :startDate AND :endDate")
    Long getPurchaseCostByDateRange(@Param("startDate") LocalDateTime startDate,
                                    @Param("endDate") LocalDateTime endDate);
}