package com.example.bookland_be.repository;

import com.example.bookland_be.entity.Bill;
import com.example.bookland_be.entity.Bill.BillStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface BillRepository extends JpaRepository<Bill, Long> {
    List<Bill> findByUserId(Long userId);
    List<Bill> findByStatus(BillStatus status);
    List<Bill> findByUserIdAndStatus(Long userId, BillStatus status);
}