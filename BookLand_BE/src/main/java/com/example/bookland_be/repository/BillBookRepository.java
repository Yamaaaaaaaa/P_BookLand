package com.example.bookland_be.repository;

import com.example.bookland_be.dto.response.TopBookDTO;
import com.example.bookland_be.entity.BillBook;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface BillBookRepository extends JpaRepository<BillBook, BillBook.BillBookId> {

    List<BillBook> findByBillId(Long billId);

    @Query("SELECT bb FROM BillBook bb " +
            "LEFT JOIN FETCH bb.book " +
            "WHERE bb.bill.id = :billId")
    List<BillBook> findByBillIdWithBook(@Param("billId") Long billId);

    @Query("SELECT SUM(bb.quantity) FROM BillBook bb WHERE bb.book.id = :bookId")
    Long getTotalQuantitySoldByBookId(@Param("bookId") Long bookId);

    /**
     * Top sách bán chạy nhất trong khoảng thời gian (chỉ tính đơn hàng COMPLETED).
     */
    @Query("SELECT new com.example.bookland_be.dto.response.TopBookDTO(" +
           "bb.book.id, bb.book.name, bb.book.bookImageUrl, bb.book.author.name, " +
           "SUM(bb.quantity), SUM(bb.quantity * bb.priceSnapshot)) " +
           "FROM BillBook bb " +
           "WHERE bb.bill.status = 'COMPLETED' AND bb.bill.createdAt BETWEEN :from AND :to " +
           "GROUP BY bb.book.id, bb.book.name, bb.book.bookImageUrl, bb.book.author.name " +
           "ORDER BY SUM(bb.quantity) DESC")
    List<TopBookDTO> findTopSellingBooks(@Param("from") LocalDateTime from,
                                         @Param("to") LocalDateTime to,
                                         Pageable pageable);
}

