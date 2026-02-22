package com.example.bookland_be.repository.specification;

import com.example.bookland_be.entity.Supplier;
import com.example.bookland_be.entity.Supplier.SupplierStatus;
import org.springframework.data.jpa.domain.Specification;

public class SupplierSpecification extends BaseSpecification {

    public static Specification<Supplier> searchByKeyword(String keyword) {
        return (root, query, cb) -> {
            if (keyword == null || keyword.trim().isEmpty()) {
                return cb.conjunction();
            }
            String likePattern = "%" + keyword.toLowerCase() + "%";
            return cb.or(
                    cb.like(cb.lower(root.get("name")), likePattern),
                    cb.like(cb.lower(root.get("email")), likePattern),
                    cb.like(cb.lower(root.get("phone")), likePattern),
                    cb.like(cb.lower(root.get("address")), likePattern)
            );
        };
    }

    public static Specification<Supplier> hasStatus(SupplierStatus status) {
        return hasFieldEqual("status", status);
    }
}
