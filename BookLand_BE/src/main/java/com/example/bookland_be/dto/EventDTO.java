// EventDTO.java (Updated)
package com.example.bookland_be.dto;

import com.example.bookland_be.entity.Event.EventStatus;
import com.example.bookland_be.enums.EventType;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EventDTO {
    private Long id;
    private String name;
    private String description;
    private EventType type;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private EventStatus status;
    private Integer priority;
    private Long createdById;
    private String createdByName;
    private LocalDateTime createdAt;
    private Boolean isActive;

    private List<EventImageDTO> images;
    private List<EventTargetDTO> targets;
    private List<EventRuleDTO> rules;
    private List<EventActionDTO> actions;
}
