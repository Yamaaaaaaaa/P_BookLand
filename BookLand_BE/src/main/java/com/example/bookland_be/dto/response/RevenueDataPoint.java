package com.example.bookland_be.dto.response;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RevenueDataPoint {
    private String label;   // e.g. "Thứ 2", "Tháng 1", "2024"
    private Double revenue;
    private Long orderCount;
}
