package com.example.bookland_be.controller.common;

import com.example.bookland_be.dto.HomeSectionDTO;
import com.example.bookland_be.dto.request.HomeSectionOrderRequest;
import com.example.bookland_be.dto.response.ApiResponse;
import com.example.bookland_be.service.HomeSectionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/home-sections")
@RequiredArgsConstructor
@Tag(name = "HomeSection", description = "API quản lý thứ tự hiển thị các section trang chủ")
public class HomeSectionController {

    private final HomeSectionService homeSectionService;

    @GetMapping
    @Operation(summary = "Lấy danh sách sections trang chủ", description = "Trả về danh sách sections đã được sắp xếp theo thứ tự hiển thị")
    public ApiResponse<List<HomeSectionDTO>> getHomeSections() {
        return ApiResponse.<List<HomeSectionDTO>>builder()
                .result(homeSectionService.getHomeSections())
                .build();
    }

    @PutMapping("/order")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_MANAGER')")
    @SecurityRequirement(name = "BearerAuth")
    @Operation(summary = "Cập nhật thứ tự sections", description = "Admin cập nhật thứ tự hiển thị các section trang chủ")
    public ApiResponse<List<HomeSectionDTO>> updateOrder(@RequestBody HomeSectionOrderRequest request) {
        return ApiResponse.<List<HomeSectionDTO>>builder()
                .result(homeSectionService.updateSectionsOrder(request.getSectionIds()))
                .build();
    }

    @PatchMapping("/{id}/visibility")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_MANAGER')")
    @SecurityRequirement(name = "BearerAuth")
    @Operation(summary = "Ẩn/Hiện section", description = "Admin bật/tắt hiển thị của một section cụ thể")
    public ApiResponse<List<HomeSectionDTO>> toggleVisibility(
            @PathVariable Long id,
            @RequestParam boolean visible) {
        return ApiResponse.<List<HomeSectionDTO>>builder()
                .result(homeSectionService.toggleVisibility(id, visible))
                .build();
    }

    @PostMapping("/reset")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_MANAGER')")
    @SecurityRequirement(name = "BearerAuth")
    @Operation(summary = "Reset về mặc định", description = "Đặt lại thứ tự sections về thứ tự mặc định ban đầu")
    public ApiResponse<List<HomeSectionDTO>> resetToDefault() {
        return ApiResponse.<List<HomeSectionDTO>>builder()
                .result(homeSectionService.resetToDefault())
                .build();
    }

    @PutMapping("/bulk-update")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_MANAGER')")
    @SecurityRequirement(name = "BearerAuth")
    @Operation(summary = "Cập nhật hàng loạt config", description = "Admin cập nhật thứ tự, ẩn/hiện, và số lượng item của các section")
    public ApiResponse<List<HomeSectionDTO>> bulkUpdateConfig(@RequestBody List<com.example.bookland_be.dto.request.HomeSectionConfigRequest> requests) {
        return ApiResponse.<List<HomeSectionDTO>>builder()
                .result(homeSectionService.bulkUpdateConfig(requests))
                .build();
    }
}
