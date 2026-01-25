package com.example.bookland_be.controller;


import com.example.bookland_be.dto.WishlistDTO;
import com.example.bookland_be.dto.request.AddToWishlistRequest;
import com.example.bookland_be.service.WishlistService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/wishlist")
@RequiredArgsConstructor
public class WishlistController {

    private final WishlistService wishlistService;

    @GetMapping("/{userId}")
    public ResponseEntity<List<WishlistDTO>> getUserWishlist(@PathVariable Long userId) {
        return ResponseEntity.ok(wishlistService.getUserWishlist(userId));
    }

    @GetMapping("/{userId}/check/{bookId}")
    public ResponseEntity<Boolean> isInWishlist(
            @PathVariable Long userId,
            @PathVariable Long bookId) {
        return ResponseEntity.ok(wishlistService.isInWishlist(userId, bookId));
    }

    @PostMapping("/{userId}")
    public ResponseEntity<WishlistDTO> addToWishlist(
            @PathVariable Long userId,
            @Valid @RequestBody AddToWishlistRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(wishlistService.addToWishlist(userId, request));
    }

    @DeleteMapping("/{userId}/books/{bookId}")
    public ResponseEntity<Void> removeFromWishlist(
            @PathVariable Long userId,
            @PathVariable Long bookId) {
        wishlistService.removeFromWishlist(userId, bookId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{userId}/clear")
    public ResponseEntity<Void> clearWishlist(@PathVariable Long userId) {
        wishlistService.clearWishlist(userId);
        return ResponseEntity.noContent().build();
    }
}