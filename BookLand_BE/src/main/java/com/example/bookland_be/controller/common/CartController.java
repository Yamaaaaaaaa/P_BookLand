package com.example.bookland_be.controller.common;


import com.example.bookland_be.dto.*;
import com.example.bookland_be.dto.request.AddToCartRequest;
import com.example.bookland_be.dto.request.UpdateCartItemRequest;
import com.example.bookland_be.dto.response.ApiResponse;
import com.example.bookland_be.entity.User;
import com.example.bookland_be.exception.AppException;
import com.example.bookland_be.exception.ErrorCode;
import com.example.bookland_be.repository.UserRepository;
import com.example.bookland_be.service.CartService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
@SecurityRequirement(name = "BearerAuth")
public class CartController {

    private final CartService cartService;
    private final UserRepository userRepository;

    /**
     * GET /api/cart/my - Lấy giỏ hàng của user hiện tại từ JWT token
     */
    @GetMapping("/my")
    public ApiResponse<CartDTO> getMyCart() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        return ApiResponse.<CartDTO>builder().result(cartService.getUserCart(user.getId())).build();
    }

    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @GetMapping("/{userId}")
    public ApiResponse<CartDTO> getUserCart(@PathVariable Long userId) {
        return ApiResponse.<CartDTO>builder().result(cartService.getUserCart(userId)).build();
    }

    @PostMapping("/{userId}/items")
    public ApiResponse<CartDTO> addToCart(
            @PathVariable Long userId,
            @Valid @RequestBody AddToCartRequest request) {
        return ApiResponse.<CartDTO>builder().result(cartService.addToCart(userId, request)).build();
    }

    @PutMapping("/{userId}/items/{bookId}")
    public ApiResponse<CartDTO> updateCartItem(
            @PathVariable Long userId,
            @PathVariable Long bookId,
            @Valid @RequestBody UpdateCartItemRequest request) {
        return ApiResponse.<CartDTO>builder().result(cartService.updateCartItem(userId, bookId, request)).build();
    }

    @DeleteMapping("/{userId}/items/{bookId}")
    public ApiResponse<CartDTO> removeFromCart(
            @PathVariable Long userId,
            @PathVariable Long bookId) {
        return ApiResponse.<CartDTO>builder().result(cartService.removeFromCart(userId, bookId)).build();
    }

    @DeleteMapping("/{userId}/clear")
    public ApiResponse<Void> clearCart(@PathVariable Long userId) {
        cartService.clearCart(userId);
        return ApiResponse.<Void>builder().build();
    }
}