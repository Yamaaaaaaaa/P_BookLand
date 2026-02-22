package com.example.bookland_be.dto.request;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PreviewBillRequest {

    @NotEmpty(message = "Danh sách sách không được để trống")
    private List<BillBookRequest> books;

    @NotNull(message = "Shipping method không được để trống")
    private Long shippingMethodId;
}
