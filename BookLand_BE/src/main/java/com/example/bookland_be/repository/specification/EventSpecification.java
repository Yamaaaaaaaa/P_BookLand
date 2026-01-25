package com.example.bookland_be.repository.specification;

import com.example.bookland_be.entity.Event;
import com.example.bookland_be.entity.Event.EventStatus;
import com.example.bookland_be.enums.EventType;
import org.springframework.data.jpa.domain.Specification;
import java.time.LocalDateTime;

public class EventSpecification extends BaseSpecification {

    public static Specification<Event> searchByKeyword(String keyword) {
        return (root, query, cb) -> {
            if (keyword == null || keyword.trim().isEmpty()) {
                return cb.conjunction();
            }
            String likePattern = "%" + keyword.toLowerCase() + "%";
            return cb.or(
                    cb.like(cb.lower(root.get("name")), likePattern),
                    cb.like(cb.lower(root.get("description")), likePattern)
            );
        };
    }

    public static Specification<Event> hasStatus(EventStatus status) {
        return hasFieldEqual("status", status);
    }

    public static Specification<Event> hasType(EventType type) {
        return hasFieldEqual("type", type);
    }

    public static Specification<Event> isActiveNow() {
        return (root, query, cb) -> {
            LocalDateTime now = LocalDateTime.now();
            return cb.and(
                    cb.equal(root.get("status"), EventStatus.ACTIVE),
                    cb.lessThanOrEqualTo(root.get("startTime"), now),
                    cb.greaterThanOrEqualTo(root.get("endTime"), now)
            );
        };
    }

    public static Specification<Event> startTimeBetween(LocalDateTime from, LocalDateTime to) {
        return (root, query, cb) -> {
            if (from == null && to == null) {
                return cb.conjunction();
            }
            if (from != null && to != null) {
                return cb.between(root.get("startTime"), from, to);
            }
            if (from != null) {
                return cb.greaterThanOrEqualTo(root.get("startTime"), from);
            }
            return cb.lessThanOrEqualTo(root.get("startTime"), to);
        };
    }
}