package com.example.bookland_be.repository;

import com.example.bookland_be.entity.Book;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface BookRepository extends JpaRepository<Book, Long>, JpaSpecificationExecutor<Book> {

    @Modifying
    @Query("UPDATE Book b SET b.stock = b.stock - :quantity WHERE b.id = :id AND b.stock >= :quantity")
    int deductStock(@Param("id") Long id, @Param("quantity") Integer quantity);

    @Query("""
            SELECT DISTINCT b FROM Book b
            LEFT JOIN b.categories c
            LEFT JOIN b.author a
            LEFT JOIN b.publisher p
            LEFT JOIN b.series s
            WHERE b.status = 'ENABLE'
              AND b.stock > 0
              AND (
                    :keyword IS NULL OR :keyword = ''
                    OR LOWER(b.name) LIKE LOWER(CONCAT('%', :keyword, '%'))
                    OR LOWER(COALESCE(b.description, '')) LIKE LOWER(CONCAT('%', :keyword, '%'))
                    OR LOWER(COALESCE(a.name, '')) LIKE LOWER(CONCAT('%', :keyword, '%'))
                    OR LOWER(COALESCE(c.name, '')) LIKE LOWER(CONCAT('%', :keyword, '%'))
                    OR LOWER(COALESCE(p.name, '')) LIKE LOWER(CONCAT('%', :keyword, '%'))
                    OR LOWER(COALESCE(s.name, '')) LIKE LOWER(CONCAT('%', :keyword, '%'))
                  )
            ORDER BY b.pin DESC, b.stock DESC, b.id DESC
            """)
    List<Book> searchAvailableBooksForChatbot(@Param("keyword") String keyword, Pageable pageable);

    @Query("SELECT b, (SELECT COALESCE(SUM(bb.quantity), 0) FROM BillBook bb JOIN bb.bill bi " +
            "          WHERE bb.book = b AND bi.status IN ('PENDING', 'APPROVED', 'SHIPPING', 'SHIPPED', 'COMPLETED') " +
            "          AND (:startDate IS NULL OR bi.createdAt >= :startDate)) as soldQty FROM Book b " +
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
