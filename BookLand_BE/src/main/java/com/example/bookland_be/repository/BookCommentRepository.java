package com.example.bookland_be.repository;

import com.example.bookland_be.entity.BookComment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BookCommentRepository extends JpaRepository<BookComment, Long> {

    List<BookComment> findByBookId(Long bookId);

    Page<BookComment> findByBookId(Long bookId, Pageable pageable);

    List<BookComment> findByUserId(Long userId);

    Page<BookComment> findByBookIdOrderByCreatedAtDesc(Long bookId, Pageable pageable);

    @Query("SELECT bc FROM BookComment bc " +
            "LEFT JOIN FETCH bc.user " +
            "WHERE bc.book.id = :bookId " +
            "ORDER BY bc.createdAt DESC")
    List<BookComment> findByBookIdWithUser(@Param("bookId") Long bookId);

    @Query("SELECT AVG(bc.rating) FROM BookComment bc WHERE bc.book.id = :bookId")
    Double getAverageRatingByBookId(@Param("bookId") Long bookId);

    @Query("SELECT COUNT(bc) FROM BookComment bc WHERE bc.book.id = :bookId")
    long countByBookId(@Param("bookId") Long bookId);

    @Query("SELECT COUNT(bc) FROM BookComment bc WHERE bc.book.id = :bookId AND bc.rating = :rating")
    long countByBookIdAndRating(@Param("bookId") Long bookId, @Param("rating") Integer rating);

    @Query("SELECT bc.rating, COUNT(bc) FROM BookComment bc WHERE bc.book.id = :bookId GROUP BY bc.rating")
    List<Object[]> countRatingsByBookId(@Param("bookId") Long bookId);

    List<BookComment> findByBillId(Long billId);

    boolean existsByUserIdAndBookIdAndBillId(Long userId, Long bookId, Long billId);
}