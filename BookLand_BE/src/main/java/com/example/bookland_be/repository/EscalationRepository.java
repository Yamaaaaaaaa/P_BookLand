package com.example.bookland_be.repository;

import com.example.bookland_be.entity.Escalation;
import com.example.bookland_be.entity.Escalation.EscalationStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EscalationRepository extends JpaRepository<Escalation, String> {

    /** Admin xem queue theo status */
    Page<Escalation> findByStatusOrderByCreatedAtAsc(EscalationStatus status, Pageable pageable);

    /** Đếm escalation đang chờ (cho badge notification admin) */
    long countByStatus(EscalationStatus status);

    /** Lấy escalation theo session */
    Optional<Escalation> findFirstBySessionIdOrderByCreatedAtDesc(String sessionId);

    /** Admin xem các escalation được assign cho họ */
    List<Escalation> findByAdminIdAndStatusInOrderByCreatedAtDesc(
        Long adminId, List<EscalationStatus> statuses);

    /** Tất cả escalation chưa xử lý (cho admin dashboard) */
    @Query("SELECT e FROM Escalation e WHERE e.status IN ('PENDING', 'ASSIGNED') " +
           "ORDER BY e.priority DESC, e.createdAt ASC")
    List<Escalation> findActiveEscalations();
}
