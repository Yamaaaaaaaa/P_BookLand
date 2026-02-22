package com.example.bookland_be.repository;

import com.example.bookland_be.entity.PaymentTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentTransactionRepository extends JpaRepository<PaymentTransaction, Long> {

    Optional<PaymentTransaction> findByTransactionCode(String transactionCode);

    Optional<PaymentTransaction> findByProviderTransactionId(String providerTransactionId);

    List<PaymentTransaction> findByBillId(Long billId);

    List<PaymentTransaction> findByStatus(PaymentTransaction.TransactionStatus status);

    @Query("SELECT pt FROM PaymentTransaction pt WHERE pt.bill.id = :billId AND pt.status = 'SUCCESS'")
    Optional<PaymentTransaction> findSuccessfulTransactionByBillId(@Param("billId") Long billId);
}