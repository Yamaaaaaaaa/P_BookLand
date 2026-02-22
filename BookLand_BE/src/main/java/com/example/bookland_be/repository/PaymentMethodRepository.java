package com.example.bookland_be.repository;

import com.example.bookland_be.entity.PaymentMethod;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentMethodRepository extends JpaRepository<PaymentMethod, Long>, org.springframework.data.jpa.repository.JpaSpecificationExecutor<PaymentMethod> {

    Optional<PaymentMethod> findByProviderCode(String providerCode);

    List<PaymentMethod> findByIsOnline(Boolean isOnline);
}