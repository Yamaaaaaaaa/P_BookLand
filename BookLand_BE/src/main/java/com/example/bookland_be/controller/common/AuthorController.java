
// AuthorController.java
package com.example.bookland_be.controller.common;

import com.example.bookland_be.dto.AuthorDTO;
import com.example.bookland_be.dto.PageResponse;
import com.example.bookland_be.dto.request.AuthorRequest;
import com.example.bookland_be.dto.response.ApiResponse;
import com.example.bookland_be.service.AuthorService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/authors")
@RequiredArgsConstructor
@SecurityRequirement(name = "BearerAuth")
public class AuthorController {

    private final AuthorService authorService;

    @GetMapping
    public ApiResponse<PageResponse<AuthorDTO>> getAllAuthors(
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDirection
    ) {
        Sort.Direction direction = sortDirection.equalsIgnoreCase("ASC")
                ? Sort.Direction.ASC
                : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));

        PageResponse<AuthorDTO> authors = authorService.getAllAuthors(keyword, pageable);
        return ApiResponse.<PageResponse<AuthorDTO>>builder().result(authors).build();
    }

    @GetMapping("/{id}")
    public ApiResponse<AuthorDTO> getAuthorById(@PathVariable Long id) {
        return ApiResponse.<AuthorDTO>builder().result(authorService.getAuthorById(id)).build();
    }

    @PostMapping
    public ApiResponse<AuthorDTO> createAuthor(@Valid @RequestBody AuthorRequest request) {
        return ApiResponse.<AuthorDTO>builder().result(authorService.createAuthor(request)).build();
    }

    @PutMapping("/{id}")
    public ApiResponse<AuthorDTO> updateAuthor(
            @PathVariable Long id,
            @Valid @RequestBody AuthorRequest request) {
        return ApiResponse.<AuthorDTO>builder().result(authorService.updateAuthor(id, request)).build();
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteAuthor(@PathVariable Long id) {
        authorService.deleteAuthor(id);
        return ApiResponse.<Void>builder().build();
    }
}