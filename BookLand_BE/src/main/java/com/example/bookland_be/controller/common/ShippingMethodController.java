package com.example.bookland_be.controller.common;

import com.example.bookland_be.dto.ShippingMethodDTO;
import com.example.bookland_be.dto.request.ShippingMethodRequest;
import com.example.bookland_be.service.ShippingMethodService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/shipping-methods")
@RequiredArgsConstructor
@SecurityRequirement(name = "BearerAuth")
public class ShippingMethodController {

    private final ShippingMethodService shippingMethodService;

    @GetMapping
    public ResponseEntity<List<ShippingMethodDTO>> getAllShippingMethods() {
        return ResponseEntity.ok(shippingMethodService.getAllShippingMethods());
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
