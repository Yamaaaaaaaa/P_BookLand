package com.example.bookland_be.repository.specification;

import com.example.bookland_be.entity.Bill;
import com.example.bookland_be.entity.Bill.BillStatus;
import org.springframework.data.jpa.domain.Specification;
import java.time.LocalDateTime;

public class BillSpecification extends BaseSpecification {

    public static Specification<Bill> hasUser(Long userId) {
        return hasNestedFieldEqual("user", "id", userId);
    }

    public static Specification<Bill> hasStatus(BillStatus status) {
        return hasFieldEqual("status", status);
    }

    public static Specification<Bill> createdBetween(LocalDateTime from, LocalDateTime to) {
        return (root, query, cb) -> {
            if (from == null && to == null) {
                return cb.conjunction();
            }
            if (from != null && to != null) {
                return cb.between(root.get("createdAt"), from, to);
            }
            if (from != null) {
                return cb.greaterThanOrEqualTo(root.get("createdAt"), from);
            }
            return cb.lessThanOrEqualTo(root.get("createdAt"), to);
        };
    }

    public static Specification<Bill> totalCostBetween(Double minCost, Double maxCost) {
        return (root, query, cb) -> {
            if (minCost == null && maxCost == null) {
                return cb.conjunction();
            }
            if (minCost != null && maxCost != null) {
                return cb.between(root.get("totalCost"), minCost, maxCost);
            }
            if (minCost != null) {
                return cb.greaterThanOrEqualTo(root.get("totalCost"), minCost);
            }
            return cb.lessThanOrEqualTo(root.get("totalCost"), maxCost);
        };
    }
}