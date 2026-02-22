package com.example.bookland_be.dto;


import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CartItemDTO {
    private Long bookId;
    private String bookName;
    private String bookImageUrl;
    private Double originalPrice;
    private Double salePrice;
    private Double finalPrice;
    private Integer quantity;
    private Integer availableStock;
    private Double subtotal;
}