package com.example.bookland_be.repository;

import com.example.bookland_be.entity.Book;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;

@Repository
public interface BookRepository extends JpaRepository<Book, Long>, JpaSpecificationExecutor<Book> {

    @Query("SELECT b FROM Book b " +
            "LEFT JOIN b.billBooks bb " +
            "LEFT JOIN bb.bill bi " +
            "LEFT JOIN b.categories c " +
            "WHERE (bi.id IS NULL OR (bi.status IN ('COMPLETED', 'SHIPPED', 'SHIPPING', 'APPROVED') " +
            "   AND (:startDate IS NULL OR bi.createdAt >= :startDate))) " +
            "AND (:keyword IS NULL OR LOWER(b.name) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
            "AND (:minPrice IS NULL OR (b.originalCost * (1 - COALESCE(b.sale, 0) / 100)) >= :minPrice) " +
            "AND (:maxPrice IS NULL OR (b.originalCost * (1 - COALESCE(b.sale, 0) / 100)) <= :maxPrice) " +
            "AND (:categoryIds IS NULL OR c.id IN :categoryIds) " +
            "AND (:authorIds IS NULL OR b.author.id IN :authorIds) " +
            "AND (:publisherIds IS NULL OR b.publisher.id IN :publisherIds) " +
            "AND (:seriesIds IS NULL OR b.series.id IN :seriesIds) " +
            "GROUP BY b " +
            "ORDER BY SUM(CASE WHEN bi.id IS NOT NULL THEN bb.quantity ELSE 0 END) DESC")
    Page<Book> findBestSellingBooks(
            @Param("keyword") String keyword,
            @Param("minPrice") Double minPrice,
            @Param("maxPrice") Double maxPrice,
            @Param("startDate") LocalDateTime startDate,
            @Param("categoryIds") java.util.List<Long> categoryIds,
            @Param("authorIds") java.util.List<Long> authorIds,
            @Param("publisherIds") java.util.List<Long> publisherIds,
            @Param("seriesIds") java.util.List<Long> seriesIds,
            Pageable pageable
    );
}
