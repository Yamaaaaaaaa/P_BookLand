package com.example.bookland_be.repository;

import com.example.bookland_be.entity.BillBook;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

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
}
