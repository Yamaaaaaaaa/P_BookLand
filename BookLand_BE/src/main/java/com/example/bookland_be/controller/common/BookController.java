package com.example.bookland_be.controller.common;

import com.example.bookland_be.dto.BookDTO;
import com.example.bookland_be.dto.request.BookRequest;
import com.example.bookland_be.dto.response.ApiResponse;
import com.example.bookland_be.entity.Book.BookStatus;
import com.example.bookland_be.service.BookService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/books")
@RequiredArgsConstructor
@SecurityRequirement(name = "BearerAuth")
public class BookController {
    private final BookService bookService;

    @GetMapping
    public ApiResponse<Page<BookDTO>> getAllBooks(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) BookStatus status,
            @RequestParam(required = false) java.util.List<Long> authorIds,
            @RequestParam(required = false) java.util.List<Long> publisherIds,
            @RequestParam(required = false) java.util.List<Long> seriesIds,
            @RequestParam(required = false) java.util.List<Long> categoryIds,
            @RequestParam(required = false) Boolean pinned,
            @RequestParam(required = false) Double minPrice,
            @RequestParam(required = false) Double maxPrice,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDirection
    ) {
        Sort.Direction direction = sortDirection.equalsIgnoreCase("ASC")
                ? Sort.Direction.ASC
                : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));

        Page<BookDTO> books = bookService.getAllBooks(keyword, status, authorIds,
                publisherIds, seriesIds, categoryIds, pinned, minPrice, maxPrice, pageable);
        return ApiResponse.<Page<BookDTO>>builder().result(books).build();
    }

    @GetMapping("/{id}")
    public ApiResponse<BookDTO> getBookById(@PathVariable Long id) {
        return ApiResponse.<BookDTO>builder().result(bookService.getBookById(id)).build();
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_MANAGER')")
    public ApiResponse<BookDTO> createBook(@Valid @RequestBody BookRequest request) {
        return ApiResponse.<BookDTO>builder().result(bookService.createBook(request)).build();
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_MANAGER')")
    public ApiResponse<BookDTO> updateBook(
            @PathVariable Long id,
            @Valid @RequestBody BookRequest request) {
        return ApiResponse.<BookDTO>builder().result(bookService.updateBook(id, request)).build();
    }

    @PatchMapping("/{id}/stock")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_MANAGER')")
    public ApiResponse<BookDTO> updateBookStock(
            @PathVariable Long id,
            @RequestParam Integer quantity) {
        return ApiResponse.<BookDTO>builder().result(bookService.updateBookStock(id, quantity)).build();
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_MANAGER')")
    public ApiResponse<Void> deleteBook(@PathVariable Long id) {
        bookService.deleteBook(id);
        return ApiResponse.<Void>builder().build();
    }
}
