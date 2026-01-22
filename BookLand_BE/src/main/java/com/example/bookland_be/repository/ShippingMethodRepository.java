package com.example.bookland_be.repository;

import com.example.bookland_be.entity.ShippingMethod;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ShippingMethodRepository extends JpaRepository<ShippingMethod, Long> {

    @Query("SELECT sm FROM ShippingMethod sm ORDER BY sm.price ASC")
    List<ShippingMethod> findAllOrderByPrice();
}