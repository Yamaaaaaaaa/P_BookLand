
// BillRepository.java
package com.example.bookland_be.repository;

import com.example.bookland_be.dto.response.TopCustomerDTO;
import com.example.bookland_be.entity.Bill;
import com.example.bookland_be.entity.Bill.BillStatus;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
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

    /**
     * Tổng doanh thu và số đơn hàng trong khoảng thời gian (chỉ tính COMPLETED).
     */
    @Query("SELECT COALESCE(SUM(b.totalCost), 0), COUNT(b) FROM Bill b " +
           "WHERE b.status = 'COMPLETED' AND b.createdAt BETWEEN :from AND :to")
    Object[] getRevenueSummary(@Param("from") LocalDateTime from, @Param("to") LocalDateTime to);

    /**
     * Danh sách đơn hàng COMPLETED trong khoảng thời gian (dùng để nhóm theo tuần/tháng/năm).
     */
    @Query("SELECT b FROM Bill b WHERE b.status = 'COMPLETED' AND b.createdAt BETWEEN :from AND :to")
    List<Bill> findCompletedBillsBetween(@Param("from") LocalDateTime from, @Param("to") LocalDateTime to);

    /**
     * Top khách hàng mua nhiều nhất theo doanh thu (COMPLETED bills) trong khoảng thời gian.
     */
    @Query("SELECT new com.example.bookland_be.dto.response.TopCustomerDTO(" +
           "b.user.id, b.user.username, b.user.email, COUNT(b), SUM(b.totalCost)) " +
           "FROM Bill b WHERE b.status = 'COMPLETED' AND b.createdAt BETWEEN :from AND :to " +
           "GROUP BY b.user.id, b.user.username, b.user.email " +
           "ORDER BY SUM(b.totalCost) DESC")
    List<TopCustomerDTO> findTopCustomers(@Param("from") LocalDateTime from,
                                          @Param("to") LocalDateTime to,
                                          Pageable pageable);
}