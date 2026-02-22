package com.example.bookland_be.repository;

import com.example.bookland_be.entity.EventLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface EventLogRepository extends JpaRepository<EventLog, Long> {

    List<EventLog> findByEventId(Long eventId);

    Page<EventLog> findByEventId(Long eventId, Pageable pageable);

    List<EventLog> findByUserId(Long userId);

    List<EventLog> findByBillId(Long billId);

    @Query("SELECT el FROM EventLog el WHERE el.event.id = :eventId " +
            "AND el.createdAt BETWEEN :startDate AND :endDate")
    List<EventLog> findByEventIdAndDateRange(@Param("eventId") Long eventId,
                                             @Param("startDate") LocalDateTime startDate,
                                             @Param("endDate") LocalDateTime endDate);

    @Query("SELECT COUNT(el) FROM EventLog el WHERE el.event.id = :eventId")
    long countByEventId(@Param("eventId") Long eventId);

    @Query("SELECT SUM(el.appliedValue) FROM EventLog el WHERE el.event.id = :eventId")
    Long getTotalDiscountByEventId(@Param("eventId") Long eventId);
}