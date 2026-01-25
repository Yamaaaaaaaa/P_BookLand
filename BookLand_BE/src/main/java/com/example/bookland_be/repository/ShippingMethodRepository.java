// ShippingMethodRepository.java
package com.example.bookland_be.repository;

import com.example.bookland_be.entity.ShippingMethod;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface ShippingMethodRepository extends JpaRepository<ShippingMethod, Long>, JpaSpecificationExecutor<ShippingMethod> {
}