package com.example.bookland_be.repository.specification;

import com.example.bookland_be.entity.Author;
import org.springframework.data.jpa.domain.Specification;

public class AuthorSpecification extends BaseSpecification {

    public static Specification<Author> searchByKeyword(String keyword) {
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
}