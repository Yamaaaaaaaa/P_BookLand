// EventActionDTO.java (Updated)
package com.example.bookland_be.dto;

import com.example.bookland_be.enums.EventActionType;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EventActionDTO {
    private Long id;
    private EventActionType actionType;
    private String actionValue;
}