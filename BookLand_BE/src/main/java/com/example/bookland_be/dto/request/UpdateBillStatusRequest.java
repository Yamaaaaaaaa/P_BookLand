package com.example.bookland_be.dto.request;

import com.example.bookland_be.entity.Bill.BillStatus;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateBillStatusRequest {
    @NotNull(message = "Status is required")
    private BillStatus status;

    private Long approvedById;
}