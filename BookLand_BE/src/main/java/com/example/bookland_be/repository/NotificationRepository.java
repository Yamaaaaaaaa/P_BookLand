package com.example.bookland_be.repository;

import com.example.bookland_be.entity.Notification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    // Find by user
    Page<Notification> findByToIdOrderByCreatedAtDesc(Long toId, Pageable pageable);

    List<Notification> findByToIdOrderByCreatedAtDesc(Long toId);

    // Filter by status
    List<Notification> findByToIdAndStatus(Long toId, Notification.NotificationStatus status);

    Page<Notification> findByToIdAndStatusOrderByCreatedAtDesc(Long toId,
                                                               Notification.NotificationStatus status,
                                                               Pageable pageable);

    // Count unread
    @Query("SELECT COUNT(n) FROM Notification n WHERE n.to.id = :toId AND n.status = 'UNREAD'")
    long countUnreadByUserId(@Param("toId") Long toId);

    // Mark as read
    @Modifying
    @Query("UPDATE Notification n SET n.status = 'READ', n.readAt = :readAt WHERE n.id = :id")
    void markAsRead(@Param("id") Long id, @Param("readAt") LocalDateTime readAt);

    @Modifying
    @Query("UPDATE Notification n SET n.status = 'READ', n.readAt = :readAt " +
            "WHERE n.to.id = :toId AND n.status = 'UNREAD'")
    void markAllAsReadByUserId(@Param("toId") Long toId, @Param("readAt") LocalDateTime readAt);

    // Delete old notifications
    @Modifying
    @Query("DELETE FROM Notification n WHERE n.createdAt < :beforeDate")
    void deleteOldNotifications(@Param("beforeDate") LocalDateTime beforeDate);

    // Find by type
    List<Notification> findByToIdAndType(Long toId, String type);
}
