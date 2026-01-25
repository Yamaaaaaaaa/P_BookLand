package com.example.bookland_be.repository.specification;

// BookSpecification.java
import com.example.bookland_be.entity.Book;
import com.example.bookland_be.entity.Book.BookStatus;
import org.springframework.data.jpa.domain.Specification;

public class BookSpecification extends BaseSpecification {

    public static Specification<Book> searchByKeyword(String keyword) {
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

    public static Specification<Book> hasStatus(BookStatus status) {
        return hasFieldEqual("status", status);
    }

    public static Specification<Book> hasAuthor(Long authorId) {
        return hasNestedFieldEqual("author", "id", authorId);
    }

    public static Specification<Book> hasPublisher(Long publisherId) {
        return hasNestedFieldEqual("publisher", "id", publisherId);
    }

    public static Specification<Book> hasSeries(Long seriesId) {
        return hasNestedFieldEqual("series", "id", seriesId);
    }

    public static Specification<Book> hasCategory(Long categoryId) {
        return (root, query, cb) -> {
            if (categoryId == null) {
                return cb.conjunction();
            }
            return cb.equal(root.join("categories").get("id"), categoryId);
        };
    }

    public static Specification<Book> isPinned(Boolean pinned) {
        return hasFieldEqual("pin", pinned);
    }

    public static Specification<Book> priceBetween(Double minPrice, Double maxPrice) {
        return (root, query, cb) -> {
            if (minPrice == null && maxPrice == null) {
                return cb.conjunction();
            }
            if (minPrice != null && maxPrice != null) {
                return cb.between(root.get("originalCost"), minPrice, maxPrice);
            }
            if (minPrice != null) {
                return cb.greaterThanOrEqualTo(root.get("originalCost"), minPrice);
            }
            return cb.lessThanOrEqualTo(root.get("originalCost"), maxPrice);
        };
    }
}
