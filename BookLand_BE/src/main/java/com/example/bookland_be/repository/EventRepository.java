package com.example.bookland_be.repository;

import com.example.bookland_be.entity.Event;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface EventRepository extends JpaRepository<Event, Long> {

    List<Event> findByStatus(Event.EventStatus status);

    List<Event> findByType(String type);

    // Find active events
    @Query("SELECT e FROM Event e WHERE e.status = 'ACTIVE' " +
            "AND e.startTime <= :now AND e.endTime >= :now " +
            "ORDER BY e.priority DESC, e.startTime ASC")
    List<Event> findActiveEvents(@Param("now") LocalDateTime now);

    // Find with details
    @Query("SELECT e FROM Event e " +
            "LEFT JOIN FETCH e.targets " +
            "LEFT JOIN FETCH e.rules " +
            "LEFT JOIN FETCH e.actions " +
            "WHERE e.id = :id")
    Optional<Event> findByIdWithDetails(@Param("id") Long id);

    // Find events for a specific book
    @Query("SELECT e FROM Event e " +
            "JOIN e.targets t " +
            "WHERE e.status = 'ACTIVE' " +
            "AND e.startTime <= :now AND e.endTime >= :now " +
            "AND t.targetType = 'BOOK' AND t.targetId = :bookId " +
            "ORDER BY e.priority DESC")
    List<Event> findActiveEventsByBookId(@Param("bookId") Long bookId,
                                         @Param("now") LocalDateTime now);

    // Find events for a category
    @Query("SELECT e FROM Event e " +
            "JOIN e.targets t " +
            "WHERE e.status = 'ACTIVE' " +
            "AND e.startTime <= :now AND e.endTime >= :now " +
            "AND t.targetType = 'CATEGORY' AND t.targetId = :categoryId " +
            "ORDER BY e.priority DESC")
    List<Event> findActiveEventsByCategoryId(@Param("categoryId") Long categoryId,
                                             @Param("now") LocalDateTime now);

    // Find expired events
    @Query("SELECT e FROM Event e WHERE e.status = 'ACTIVE' AND e.endTime < :now")
    List<Event> findExpiredEvents(@Param("now") LocalDateTime now);

    // Find upcoming events
    @Query("SELECT e FROM Event e WHERE e.status = 'ACTIVE' AND e.startTime > :now " +
            "ORDER BY e.startTime ASC")
    List<Event> findUpcomingEvents(@Param("now") LocalDateTime now);
}