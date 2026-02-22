package com.example.bookland_be.controller;

import com.example.bookland_be.dto.request.BookCommentRequest;
import com.example.bookland_be.dto.response.ApiResponse;
import com.example.bookland_be.dto.response.BookCommentResponse;
import com.example.bookland_be.dto.response.BookCommentSummaryResponse;
import com.example.bookland_be.service.BookCommentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/book-comments")
@RequiredArgsConstructor
@Tag(name = "Book Comment")
@SecurityRequirement(name = "BearerAuth")
public class BookCommentController {

    private final BookCommentService bookCommentService;

    @PostMapping
    @Operation(summary = "Create a comment (User)")
    public ApiResponse<BookCommentResponse> createComment(@RequestBody @Valid BookCommentRequest request) {
        return ApiResponse.<BookCommentResponse>builder()
                .result(bookCommentService.createComment(request))
                .build();
    }

    @GetMapping
    @Operation(summary = "Get all comments with filters")
    public ApiResponse<Page<BookCommentResponse>> getAllComments(
            @RequestParam(required = false) Long bookId,
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) Long billId,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDirection) {
        
        Sort.Direction direction = Sort.Direction.fromString(sortDirection.toUpperCase());
        Pageable pageable = PageRequest.of(page - 1, size, Sort.by(direction, sortBy));
        
        return ApiResponse.<Page<BookCommentResponse>>builder()
                .result(bookCommentService.getAllComments(bookId, userId, billId, pageable))
                .build();
    }

    @GetMapping("/book/{bookId}")
    @Operation(summary = "Get comments by Book ID (Summary with Average)")
    public ApiResponse<BookCommentSummaryResponse> getCommentsByBook(
            @PathVariable Long bookId,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDirection) {

        Sort.Direction direction = Sort.Direction.fromString(sortDirection.toUpperCase());
        Pageable pageable = PageRequest.of(page - 1, size, Sort.by(direction, sortBy));

        return ApiResponse.<BookCommentSummaryResponse>builder()
                .result(bookCommentService.getCommentsByBook(bookId, pageable))
                .build();
    }

    @GetMapping("/user")
    @Operation(summary = "Get comments by Current User")
    public ApiResponse<List<BookCommentResponse>> getCommentsByUser() {
        return ApiResponse.<List<BookCommentResponse>>builder()
                .result(bookCommentService.getCommentsByUser())
                .build();
    }

    @GetMapping("/bill/{billId}")
    @Operation(summary = "Get comments by Bill ID")
    public ApiResponse<List<BookCommentResponse>> getCommentsByBill(@PathVariable Long billId) {
        return ApiResponse.<List<BookCommentResponse>>builder()
                .result(bookCommentService.getCommentsByBill(billId))
                .build();
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update comment (User)")
    public ApiResponse<BookCommentResponse> updateComment(@PathVariable Long id, @RequestBody @Valid BookCommentRequest request) {
        return ApiResponse.<BookCommentResponse>builder()
                .result(bookCommentService.updateComment(id, request))
                .build();
    }

    @PutMapping("/admin/{id}")
    @Operation(summary = "Update comment (Admin)")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<BookCommentResponse> updateCommentAdmin(@PathVariable Long id, @RequestBody @Valid BookCommentRequest request) {
        return ApiResponse.<BookCommentResponse>builder()
                .result(bookCommentService.updateCommentAdmin(id, request))
                .build();
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete comment (User)")
    public ApiResponse<String> deleteComment(@PathVariable Long id) {
        bookCommentService.deleteComment(id);
        return ApiResponse.<String>builder()
                .result("Comment deleted successfully")
                .build();
    }

    @DeleteMapping("/admin/{id}")
    @Operation(summary = "Delete comment (Admin)")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<String> deleteCommentAdmin(@PathVariable Long id) {
        bookCommentService.deleteCommentAdmin(id);
        return ApiResponse.<String>builder()
                .result("Comment deleted successfully")
                .build();
    }
}
