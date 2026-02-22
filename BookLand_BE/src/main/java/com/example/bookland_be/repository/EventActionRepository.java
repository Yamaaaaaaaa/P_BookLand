package com.example.bookland_be.repository;

import com.example.bookland_be.entity.EventAction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EventActionRepository extends JpaRepository<EventAction, Long> {

    List<EventAction> findByEventId(Long eventId);

    List<EventAction> findByEventIdAndActionType(Long eventId, String actionType);

    @Modifying
    @Query("DELETE FROM EventAction ea WHERE ea.event.id = :eventId")
    void deleteByEventId(@Param("eventId") Long eventId);
}
