// SupplierController.java
package com.example.bookland_be.controller.common;

import com.example.bookland_be.dto.SupplierDTO;
import com.example.bookland_be.dto.request.SupplierRequest;
import com.example.bookland_be.dto.response.ApiResponse;
import com.example.bookland_be.entity.Supplier.SupplierStatus;
import com.example.bookland_be.service.SupplierService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/suppliers")
@RequiredArgsConstructor
@SecurityRequirement(name = "BearerAuth")
public class SupplierController {

    private final SupplierService supplierService;

    @GetMapping
    public ApiResponse<Page<SupplierDTO>> getAllSuppliers(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) SupplierStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDirection
    ) {
        Sort.Direction direction = sortDirection.equalsIgnoreCase("ASC")
                ? Sort.Direction.ASC
                : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));

        Page<SupplierDTO> suppliers = supplierService.getAllSuppliers(keyword, status, pageable);
        return ApiResponse.<Page<SupplierDTO>>builder().result(suppliers).build();
    }

    @GetMapping("/{id}")
    public ApiResponse<SupplierDTO> getSupplierById(@PathVariable Long id) {
        return ApiResponse.<SupplierDTO>builder().result(supplierService.getSupplierById(id)).build();
    }

    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_MANAGER')")
    @PostMapping
    public ApiResponse<SupplierDTO> createSupplier(@Valid @RequestBody SupplierRequest request) {
        return ApiResponse.<SupplierDTO>builder().result(supplierService.createSupplier(request)).build();
    }
    
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_MANAGER')")
    @PutMapping("/{id}")
    public ApiResponse<SupplierDTO> updateSupplier(
            @PathVariable Long id,
            @Valid @RequestBody SupplierRequest request) {
        return ApiResponse.<SupplierDTO>builder().result(supplierService.updateSupplier(id, request)).build();
    }
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_MANAGER')")
    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteSupplier(@PathVariable Long id) {
        supplierService.deleteSupplier(id);
        return ApiResponse.<Void>builder().build();
    }
}