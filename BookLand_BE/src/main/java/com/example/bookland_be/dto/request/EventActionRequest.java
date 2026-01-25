package com.example.bookland_be.dto.request;

import com.example.bookland_be.enums.EventActionType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EventActionRequest {

    @NotNull(message = "Action type không được để trống")
    private EventActionType actionType;

    @NotBlank(message = "Action value không được để trống")
    private String actionValue;
}