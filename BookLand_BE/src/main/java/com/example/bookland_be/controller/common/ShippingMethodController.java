
// ShippingMethodController.java
package com.example.bookland_be.controller.common;

import com.example.bookland_be.dto.ShippingMethodDTO;
import com.example.bookland_be.dto.request.ShippingMethodRequest;
import com.example.bookland_be.service.ShippingMethodService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/shipping-methods")
@RequiredArgsConstructor
@SecurityRequirement(name = "BearerAuth")
public class ShippingMethodController {

    private final ShippingMethodService shippingMethodService;

    @GetMapping
    public ResponseEntity<Page<ShippingMethodDTO>> getAllShippingMethods(
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
        return ResponseEntity.ok(shippingMethods);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ShippingMethodDTO> getShippingMethodById(@PathVariable Long id) {
        return ResponseEntity.ok(shippingMethodService.getShippingMethodById(id));
    }

    @PostMapping
    public ResponseEntity<ShippingMethodDTO> createShippingMethod(
            @Valid @RequestBody ShippingMethodRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(shippingMethodService.createShippingMethod(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ShippingMethodDTO> updateShippingMethod(
            @PathVariable Long id,
            @Valid @RequestBody ShippingMethodRequest request) {
        return ResponseEntity.ok(shippingMethodService.updateShippingMethod(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteShippingMethod(@PathVariable Long id) {
        shippingMethodService.deleteShippingMethod(id);
        return ResponseEntity.noContent().build();
    }
}