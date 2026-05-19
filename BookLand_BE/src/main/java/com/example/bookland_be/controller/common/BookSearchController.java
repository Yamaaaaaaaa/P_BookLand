package com.example.bookland_be.controller.common;

import com.example.bookland_be.dto.response.ApiResponse;
import com.example.bookland_be.elasticsearch.document.BookDocument;
import com.example.bookland_be.elasticsearch.service.BookSearchService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/books/search")
@RequiredArgsConstructor
@SecurityRequirement(name = "BearerAuth")
public class BookSearchController {

    private final BookSearchService bookSearchService;

    @GetMapping
    public ApiResponse<Page<BookDocument>> searchBooks(
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            // Khi có keyword -> sắp xếp theo độ liên quan (_score). Khi không có keyword -> có thể sắp xếp theo trường khác.
            @RequestParam(required = false) String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDirection
    ) {
        Pageable pageable;

        if (sortBy == null || sortBy.isBlank() || "id".equalsIgnoreCase(sortBy)) {
            // Sắp xếp theo độ liên quan (relevance score) - mặc định tốt nhất cho search
            pageable = PageRequest.of(page, size);
        } else {
            Sort.Direction direction = sortDirection.equalsIgnoreCase("ASC")
                    ? Sort.Direction.ASC
                    : Sort.Direction.DESC;
            pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));
        }

        Page<BookDocument> result = bookSearchService.searchBooks(keyword, pageable);
        return ApiResponse.<Page<BookDocument>>builder().result(result).build();
    }

    @PostMapping("/sync")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_MANAGER')")
    public ApiResponse<String> syncAllBooks() {
        bookSearchService.syncAllBooks();
        return ApiResponse.<String>builder().result("Successfully synchronized all books to Elasticsearch!").build();
    }
}
