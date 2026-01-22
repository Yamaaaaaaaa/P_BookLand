package com.example.bookland_be.dto;

import com.example.bookland_be.entity.Supplier.SupplierStatus;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SupplierDTO {
    private Long id;
    private String name;
    private String phone;
    private String email;
    private String address;
    private SupplierStatus status;
}