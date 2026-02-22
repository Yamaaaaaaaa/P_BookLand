package com.example.bookland_be.controller.common;

import com.example.bookland_be.dto.CategoryDTO;
import com.example.bookland_be.dto.PageResponse;
import com.example.bookland_be.dto.request.CategoryRequest;
import com.example.bookland_be.dto.response.ApiResponse;
import com.example.bookland_be.service.CategoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
@SecurityRequirement(name = "BearerAuth")
@Tag(name = "Category", description = "API quản lý danh mục sách")
public class CategoryController {

    private final CategoryService categoryService;

    @GetMapping
    @Operation(summary = "Lấy danh sách danh mục", description = "Lấy danh sách danh mục có phân trang và tìm kiếm")
    public ApiResponse<PageResponse<CategoryDTO>> getAllCategories(
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "ASC") String sortDirection
    ) {
        Sort.Direction direction = sortDirection.equalsIgnoreCase("ASC")
                ? Sort.Direction.ASC
                : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));

        PageResponse<CategoryDTO> categories = categoryService.getAllCategories(keyword, pageable);
        return ApiResponse.<PageResponse<CategoryDTO>>builder().result(categories).build();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Lấy chi tiết danh mục", description = "Lấy thông tin chi tiết của một danh mục")
    public ApiResponse<CategoryDTO> getCategoryById(@PathVariable Long id) {
        return ApiResponse.<CategoryDTO>builder()
                .result(categoryService.getCategoryById(id))
                .build();
    }

    @PostMapping
    @Operation(summary = "Tạo danh mục mới", description = "Tạo một danh mục sách mới")
    public ApiResponse<CategoryDTO> createCategory(@Valid @RequestBody CategoryRequest request) {
        return ApiResponse.<CategoryDTO>builder()
                .result(categoryService.createCategory(request))
                .build();
    }

    @PutMapping("/{id}")
    @Operation(summary = "Cập nhật danh mục", description = "Cập nhật thông tin danh mục")
    public ApiResponse<CategoryDTO> updateCategory(
            @PathVariable Long id,
            @Valid @RequestBody CategoryRequest request) {
        return ApiResponse.<CategoryDTO>builder()
                .result(categoryService.updateCategory(id, request))
                .build();
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Xóa danh mục", description = "Xóa danh mục (chỉ khi không có sách nào)")
    public ApiResponse<Void> deleteCategory(@PathVariable Long id) {
        categoryService.deleteCategory(id);
        return ApiResponse.<Void>builder().build();
    }
}
