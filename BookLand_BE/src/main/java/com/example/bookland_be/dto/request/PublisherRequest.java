package com.example.bookland_be.dto.request;


import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PublisherRequest {
    @NotBlank(message = "Publisher name is required")
    private String name;
    private String description;
}
