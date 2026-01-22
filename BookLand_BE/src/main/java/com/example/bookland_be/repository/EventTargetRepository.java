package com.example.bookland_be.repository;

import com.example.bookland_be.entity.EventTarget;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EventTargetRepository extends JpaRepository<EventTarget, Long> {

    List<EventTarget> findByEventId(Long eventId);

    List<EventTarget> findByTargetTypeAndTargetId(String targetType, Long targetId);

    @Modifying
    @Query("DELETE FROM EventTarget et WHERE et.event.id = :eventId")
    void deleteByEventId(@Param("eventId") Long eventId);
}
