
// ShippingMethodController.java
package com.example.bookland_be.controller.common;

import com.example.bookland_be.dto.ShippingMethodDTO;
import com.example.bookland_be.dto.request.ShippingMethodRequest;
import com.example.bookland_be.dto.response.ApiResponse;
import com.example.bookland_be.service.ShippingMethodService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/shipping-methods")
@RequiredArgsConstructor
@SecurityRequirement(name = "BearerAuth")
public class ShippingMethodController {

    private final ShippingMethodService shippingMethodService;

    @GetMapping
    public ApiResponse<Page<ShippingMethodDTO>> getAllShippingMethods(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "ASC") String sortDirection
    ) {
        Sort.Direction direction = sortDirection.equalsIgnoreCase("ASC")
                ? Sort.Direction.ASC
                : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));

        Page<ShippingMethodDTO> shippingMethods = shippingMethodService.getAllShippingMethods(pageable);
        return ApiResponse.<Page<ShippingMethodDTO>>builder().result(shippingMethods).build();
    }

    @GetMapping("/{id}")
    public ApiResponse<ShippingMethodDTO> getShippingMethodById(@PathVariable Long id) {
        return ApiResponse.<ShippingMethodDTO>builder().result(shippingMethodService.getShippingMethodById(id)).build();
    }

    @PostMapping
    public ApiResponse<ShippingMethodDTO> createShippingMethod(
            @Valid @RequestBody ShippingMethodRequest request) {
        return ApiResponse.<ShippingMethodDTO>builder().result(shippingMethodService.createShippingMethod(request)).build();
    }

    @PutMapping("/{id}")
    public ApiResponse<ShippingMethodDTO> updateShippingMethod(
            @PathVariable Long id,
            @Valid @RequestBody ShippingMethodRequest request) {
        return ApiResponse.<ShippingMethodDTO>builder().result(shippingMethodService.updateShippingMethod(id, request)).build();
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteShippingMethod(@PathVariable Long id) {
        shippingMethodService.deleteShippingMethod(id);
        return ApiResponse.<Void>builder().build();
    }
}