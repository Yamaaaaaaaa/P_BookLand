package com.example.bookland_be.controller.common;

import com.example.bookland_be.dto.request.*;
import com.example.bookland_be.dto.response.ApiResponse;
import com.example.bookland_be.dto.response.UserResponse;
import com.example.bookland_be.entity.User.UserStatus;
import com.example.bookland_be.service.UserService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@SecurityRequirement(name = "BearerAuth")
public class UserController {

    private final UserService userService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ROLE_ADMIN','ROLE_MANAGER')")
    public ApiResponse<Page<UserResponse>> getAllUsers(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) UserStatus status,
            @RequestParam(required = false) Long roleId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDirection
    ) {
        Sort.Direction direction = sortDirection.equalsIgnoreCase("ASC")
                ? Sort.Direction.ASC
                : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));

        Page<UserResponse> users = userService.getAllUsers(keyword, status, roleId, pageable);
        return ApiResponse.<Page<UserResponse>>builder().result(users).build();
    }

    /**
     * Get own profile - Lấy thông tin profile của chính mình
     */
    @GetMapping("/me")
    public ApiResponse<UserResponse> getOwnProfile() {
        // Lấy email từ token
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        
        UserResponse user = userService.getUserByEmail(email);
        return ApiResponse.<UserResponse>builder().result(user).build();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_MANAGER')")
    public ApiResponse<UserResponse> getUserById(@PathVariable Long id) {
        UserResponse user = userService.getUserById(id);
        return ApiResponse.<UserResponse>builder().result(user).build();
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_MANAGER')")
    public ApiResponse<UserResponse> createUser(@Valid @RequestBody UserRequest request) {
        UserResponse createdUser = userService.createUser(request);
        return ApiResponse.<UserResponse>builder().result(createdUser).build();
    }

    @PutMapping("/{id}")
    public ApiResponse<UserResponse> updateUser(
            @PathVariable Long id,
            @Valid @RequestBody UserUpdateRequest request
    ) {
        UserResponse updatedUser = userService.updateUser(id, request);
        return ApiResponse.<UserResponse>builder().result(updatedUser).build();
    }

    @PutMapping("/{id}/roles")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_MANAGER')")
    public ApiResponse<UserResponse> updateUserRoles(
            @PathVariable Long id,
            @Valid @RequestBody UpdateRolesRequest request
    ) {
        UserResponse updatedUser = userService.updateUserRoles(id, request);
        return ApiResponse.<UserResponse>builder().result(updatedUser).build();
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_MANAGER')")
    public ApiResponse<UserResponse> updateUserStatus(
            @PathVariable Long id,
            @RequestParam UserStatus status
    ) {
        UserResponse updatedUser = userService.updateUserStatus(id, status);
        return ApiResponse.<UserResponse>builder().result(updatedUser).build();
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_MANAGER')")
    public ApiResponse<Void> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ApiResponse.<Void>builder().build();
    }
}
