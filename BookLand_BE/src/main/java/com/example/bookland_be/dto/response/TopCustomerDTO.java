package com.example.bookland_be.dto.response;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TopCustomerDTO {
    private Long userId;
    private String username;
    private String email;
    private Long totalOrders;
    private Double totalSpent;
}
