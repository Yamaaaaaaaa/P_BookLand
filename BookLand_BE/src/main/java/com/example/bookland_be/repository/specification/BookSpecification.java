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

    public static Specification<Book> hasAuthors(java.util.List<Long> authorIds) {
        return (root, query, cb) -> {
            if (authorIds == null || authorIds.isEmpty()) {
                return cb.conjunction();
            }
            return root.get("author").get("id").in(authorIds);
        };
    }

    public static Specification<Book> hasPublishers(java.util.List<Long> publisherIds) {
        return (root, query, cb) -> {
            if (publisherIds == null || publisherIds.isEmpty()) {
                return cb.conjunction();
            }
            return root.get("publisher").get("id").in(publisherIds);
        };
    }

    public static Specification<Book> hasSeries(java.util.List<Long> seriesIds) {
        return (root, query, cb) -> {
            if (seriesIds == null || seriesIds.isEmpty()) {
                return cb.conjunction();
            }
            return root.get("series").get("id").in(seriesIds);
        };
    }

    public static Specification<Book> hasCategories(java.util.List<Long> categoryIds) {
        return (root, query, cb) -> {
            if (categoryIds == null || categoryIds.isEmpty()) {
                return cb.conjunction();
            }
            query.distinct(true);
            return root.join("categories").get("id").in(categoryIds);
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
