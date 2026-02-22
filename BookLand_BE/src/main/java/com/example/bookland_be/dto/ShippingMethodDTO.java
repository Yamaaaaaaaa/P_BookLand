package com.example.bookland_be.dto;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ShippingMethodDTO {
    private Long id;
    private String name;
    private String description;
    private Double price;
}
