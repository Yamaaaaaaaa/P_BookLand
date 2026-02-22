package com.example.bookland_be.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SerieRequest {
    @NotBlank(message = "Series name is required")
    private String name;
    private String description;
}