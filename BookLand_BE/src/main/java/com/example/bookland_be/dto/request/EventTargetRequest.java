package com.example.bookland_be.dto.request;

import com.example.bookland_be.enums.EventTargetType;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EventTargetRequest {

    @NotNull(message = "Target type không được để trống")
    private EventTargetType targetType;

    @NotNull(message = "Target ID không được để trống")
    private Long targetId;
}