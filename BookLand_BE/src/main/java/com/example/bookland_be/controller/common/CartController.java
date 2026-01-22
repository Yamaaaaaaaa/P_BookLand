package com.example.bookland_be.controller.common;


import com.example.bookland_be.dto.*;
import com.example.bookland_be.dto.request.AddToCartRequest;
import com.example.bookland_be.dto.request.UpdateCartItemRequest;
import com.example.bookland_be.service.CartService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
@SecurityRequirement(name = "BearerAuth")
public class CartController {

    private final CartService cartService;

    @GetMapping("/{userId}")
    public ResponseEntity<CartDTO> getUserCart(@PathVariable Long userId) {
        return ResponseEntity.ok(cartService.getUserCart(userId));
    }

    @PostMapping("/{userId}/items")
    public ResponseEntity<CartDTO> addToCart(
            @PathVariable Long userId,
            @Valid @RequestBody AddToCartRequest request) {
        return ResponseEntity.ok(cartService.addToCart(userId, request));
    }

    @PutMapping("/{userId}/items/{bookId}")
    public ResponseEntity<CartDTO> updateCartItem(
            @PathVariable Long userId,
            @PathVariable Long bookId,
            @Valid @RequestBody UpdateCartItemRequest request) {
        return ResponseEntity.ok(cartService.updateCartItem(userId, bookId, request));
    }

    @DeleteMapping("/{userId}/items/{bookId}")
    public ResponseEntity<CartDTO> removeFromCart(
            @PathVariable Long userId,
            @PathVariable Long bookId) {
        return ResponseEntity.ok(cartService.removeFromCart(userId, bookId));
    }

    @DeleteMapping("/{userId}/clear")
    public ResponseEntity<Void> clearCart(@PathVariable Long userId) {
        cartService.clearCart(userId);
        return ResponseEntity.noContent().build();
    }
}