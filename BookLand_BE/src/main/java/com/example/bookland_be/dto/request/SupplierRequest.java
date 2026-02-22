package com.example.bookland_be.dto.request;

import com.example.bookland_be.entity.Supplier.SupplierStatus;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SupplierRequest {
    @NotBlank(message = "Supplier name is required")
    private String name;

    private String phone;

    @Email(message = "Invalid email format")
    private String email;

    private String address;
    private SupplierStatus status;
}
