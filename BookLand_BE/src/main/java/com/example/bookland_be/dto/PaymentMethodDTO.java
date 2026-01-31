package com.example.bookland_be.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentMethodDTO {
    private Long id;
    private String name;
    private String providerCode;
    private Boolean isOnline;
    private String description;
}
