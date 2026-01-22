package com.example.bookland_be.dto;
import com.example.bookland_be.entity.Bill.BillStatus;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BillDTO {
    private Long id;
    private Long userId;
    private String userName;
    private Long paymentMethodId;
    private String paymentMethodName;
    private Long shippingMethodId;
    private String shippingMethodName;
    private Double shippingCost;
    private Double totalCost;
    private Long approvedById;
    private String approvedByName;
    private BillStatus status;
    private List<BillBookDTO> books;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime approvedAt;
}
