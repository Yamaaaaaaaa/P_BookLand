package com.example.bookland_be.controller;


import com.example.bookland_be.dto.WishlistDTO;
import com.example.bookland_be.dto.request.AddToWishlistRequest;
import com.example.bookland_be.dto.response.ApiResponse;
import com.example.bookland_be.service.WishlistService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/wishlist")
@RequiredArgsConstructor
public class WishlistController {

    private final WishlistService wishlistService;

    @GetMapping("/{userId}")
    public ApiResponse<List<WishlistDTO>> getUserWishlist(@PathVariable Long userId) {
        return ApiResponse.<List<WishlistDTO>>builder().result(wishlistService.getUserWishlist(userId)).build();
    }

    @GetMapping("/{userId}/check/{bookId}")
    public ApiResponse<Boolean> isInWishlist(
            @PathVariable Long userId,
            @PathVariable Long bookId) {
        return ApiResponse.<Boolean>builder().result(wishlistService.isInWishlist(userId, bookId)).build();
    }

    @PostMapping("/{userId}")
    public ApiResponse<WishlistDTO> addToWishlist(
            @PathVariable Long userId,
            @Valid @RequestBody AddToWishlistRequest request) {
        return ApiResponse.<WishlistDTO>builder().result(wishlistService.addToWishlist(userId, request)).build();
    }

    @DeleteMapping("/{userId}/books/{bookId}")
    public ApiResponse<Void> removeFromWishlist(
            @PathVariable Long userId,
            @PathVariable Long bookId) {
        wishlistService.removeFromWishlist(userId, bookId);
        return ApiResponse.<Void>builder().build();
    }

    @DeleteMapping("/{userId}/clear")
    public ApiResponse<Void> clearWishlist(@PathVariable Long userId) {
        wishlistService.clearWishlist(userId);
        return ApiResponse.<Void>builder().build();
    }
}