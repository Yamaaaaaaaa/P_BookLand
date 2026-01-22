package com.example.bookland_be.dto.request;


import jakarta.validation.constraints.NotNull;
import lombok.*;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateBillRequest {
    @NotNull(message = "User ID is required")
    private Long userId;

    @NotNull(message = "Payment method is required")
    private Long paymentMethodId;

    @NotNull(message = "Shipping method is required")
    private Long shippingMethodId;

    @NotNull(message = "Books are required")
    private List<BillBookRequest> books;
}