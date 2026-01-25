// EventTargetDTO.java (Updated)
package com.example.bookland_be.dto;

import com.example.bookland_be.enums.EventTargetType;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EventTargetDTO {
    private Long id;
    private EventTargetType targetType;
    private Long targetId;
}