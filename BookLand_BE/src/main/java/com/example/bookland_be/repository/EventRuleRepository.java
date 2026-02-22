package com.example.bookland_be.repository;

import com.example.bookland_be.entity.EventRule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EventRuleRepository extends JpaRepository<EventRule, Long> {

    List<EventRule> findByEventId(Long eventId);

    List<EventRule> findByEventIdAndRuleType(Long eventId, String ruleType);

    @Modifying
    @Query("DELETE FROM EventRule er WHERE er.event.id = :eventId")
    void deleteByEventId(@Param("eventId") Long eventId);
}