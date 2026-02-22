package com.example.bookland_be.controller;


import com.example.bookland_be.dto.WishlistDTO;
import com.example.bookland_be.dto.request.AddToWishlistRequest;
import com.example.bookland_be.dto.response.ApiResponse;
import com.example.bookland_be.entity.User;
import com.example.bookland_be.exception.AppException;
import com.example.bookland_be.exception.ErrorCode;
import com.example.bookland_be.repository.UserRepository;
import com.example.bookland_be.service.WishlistService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/wishlist")
@RequiredArgsConstructor
@SecurityRequirement(name = "BearerAuth")
public class WishlistController {

    private final WishlistService wishlistService;
    private final UserRepository userRepository;

    /**
     * GET /api/wishlist/my - Lấy wishlist của user hiện tại từ JWT token
     */
    @GetMapping("/my")
    public ApiResponse<List<WishlistDTO>> getMyWishlist() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        return ApiResponse.<List<WishlistDTO>>builder().result(wishlistService.getUserWishlist(user.getId())).build();
    }

    @PreAuthorize("hasRole('ROLE_ADMIN')")
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