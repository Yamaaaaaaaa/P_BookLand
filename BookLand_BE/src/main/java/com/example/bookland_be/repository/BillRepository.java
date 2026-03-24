
// BillRepository.java
package com.example.bookland_be.repository;

import com.example.bookland_be.entity.Bill;
import com.example.bookland_be.entity.Bill.BillStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface BillRepository extends JpaRepository<Bill, Long>, JpaSpecificationExecutor<Bill> {

    /**
     * Cập nhật trực tiếp status trong DB mà không cần load toàn bộ entity (tránh deadlock).
     */
    @Modifying
    @Query("UPDATE Bill b SET b.status = :status, b.updatedAt = :updatedAt WHERE b.id = :id")
    int updateStatusById(@Param("id") Long id,
                         @Param("status") BillStatus status,
                         @Param("updatedAt") LocalDateTime updatedAt);

    /**
     * Load bill kèm billBooks trong 1 query để tránh lazy-load trong transaction gây deadlock.
     */
    @Query("SELECT b FROM Bill b LEFT JOIN FETCH b.billBooks bb LEFT JOIN FETCH bb.book WHERE b.id = :id")
    Optional<Bill> findByIdWithBooks(@Param("id") Long id);
}