package com.example.bookland_be.dto;

import lombok.*;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WishlistDTO {
    private Long id;
    private Long userId;
    private Long bookId;
    private String bookName;
    private String bookImageUrl;
    private Double originalPrice;
    private Double salePrice;
    private Double finalPrice;
    private Integer stock;
    private LocalDateTime createdAt;
}
