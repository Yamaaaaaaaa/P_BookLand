package com.example.bookland_be.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookPreviewDTO {
    private Long bookId;
    private String bookName;
    private String bookImageUrl;

    private Double originalPrice;         // Giá gốc (đã tính sale của book)
    private Double eventDiscountedPrice;  // Giá sau khi áp dụng event
    private Double finalPrice;            // Giá cuối cùng

    private Integer quantity;
    private Double subtotal;

    private Boolean hasEventDiscount;     // Có được giảm giá từ event không
}

//
//
//// ============= HELPER DTO FOR RESPONSE =============
//
//// BillWithEventDTO.java
//package com.example.bookland_be.dto;
//
//import lombok.*;
//        import java.util.List;
//
//@Data
//@NoArgsConstructor
//@AllArgsConstructor
//@Builder
//public class BillWithEventDTO extends BillDTO {
//    private Long appliedEventId;
//    private String appliedEventName;
//    private Integer totalDiscount;
//    private List<BookEventDiscountDTO> discountDetails;
//}
//
//// BookEventDiscountDTO.java
//package com.example.bookland_be.dto;
//
//import lombok.*;
//
//@Data
//@NoArgsConstructor
//@AllArgsConstructor
//@Builder
//public class BookEventDiscountDTO {
//    private Long bookId;
//    private String bookName;
//    private Double originalPrice;
//    private Double discountedPrice;
//    private Double discountAmount;
//    private Integer quantity;
//}