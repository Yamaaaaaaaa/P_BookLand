package com.example.bookland_be.dto.response;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TopBookDTO {
    private Long bookId;
    private String bookName;
    private String bookImageUrl;
    private String authorName;
    private Long totalQuantitySold;
    private Double totalRevenue;
}
