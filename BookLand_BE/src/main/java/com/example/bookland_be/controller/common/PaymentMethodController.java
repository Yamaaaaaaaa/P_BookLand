package com.example.bookland_be.controller.common;

import com.example.bookland_be.dto.PaymentMethodDTO;
import com.example.bookland_be.dto.request.PaymentMethodRequest;
import com.example.bookland_be.dto.response.ApiResponse;
import com.example.bookland_be.service.PaymentMethodService;
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
@RequestMapping("/api/payment-methods")
@RequiredArgsConstructor
@SecurityRequirement(name = "BearerAuth")
public class PaymentMethodController {

    private final PaymentMethodService paymentMethodService;

    @GetMapping
    public ApiResponse<Page<PaymentMethodDTO>> getAllPaymentMethods(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "ASC") String sortDirection
    ) {
        Sort.Direction direction = sortDirection.equalsIgnoreCase("ASC")
                ? Sort.Direction.ASC
                : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));

        Page<PaymentMethodDTO> paymentMethods = paymentMethodService.getAllPaymentMethods(pageable);
        return ApiResponse.<Page<PaymentMethodDTO>>builder().result(paymentMethods).build();
    }

    @GetMapping("/{id}")
    public ApiResponse<PaymentMethodDTO> getPaymentMethodById(@PathVariable Long id) {
        return ApiResponse.<PaymentMethodDTO>builder().result(paymentMethodService.getPaymentMethodById(id)).build();
    }

    @PreAuthorize("hasAnyRole('ROLE_ADMIN')")
    @PostMapping
    public ApiResponse<PaymentMethodDTO> createPaymentMethod(
            @Valid @RequestBody PaymentMethodRequest request) {
        return ApiResponse.<PaymentMethodDTO>builder().result(paymentMethodService.createPaymentMethod(request)).build();
    }

    @PreAuthorize("hasAnyRole('ROLE_ADMIN')")
    @PutMapping("/{id}")
    public ApiResponse<PaymentMethodDTO> updatePaymentMethod(
            @PathVariable Long id,
            @Valid @RequestBody PaymentMethodRequest request) {
        return ApiResponse.<PaymentMethodDTO>builder().result(paymentMethodService.updatePaymentMethod(id, request)).build();
    }

    @PreAuthorize("hasAnyRole('ROLE_ADMIN')")
    @DeleteMapping("/{id}")
    public ApiResponse<Void> deletePaymentMethod(@PathVariable Long id) {
        paymentMethodService.deletePaymentMethod(id);
        return ApiResponse.<Void>builder().build();
    }
}
