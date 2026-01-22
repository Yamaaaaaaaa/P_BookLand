package com.example.bookland_be.controller.common;


import com.example.bookland_be.dto.BookDTO;
import com.example.bookland_be.dto.request.BookRequest;
import com.example.bookland_be.entity.Book.BookStatus;
import com.example.bookland_be.service.BookService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/books")
@RequiredArgsConstructor
@SecurityRequirement(name = "BearerAuth")
public class BookController {

    private final BookService bookService;

    @GetMapping
    public ResponseEntity<List<BookDTO>> getAllBooks() {
        return ResponseEntity.ok(bookService.getAllBooks());
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<BookDTO>> getBooksByStatus(@PathVariable BookStatus status) {
        return ResponseEntity.ok(bookService.getBooksByStatus(status));
    }

    @GetMapping("/pinned")
    public ResponseEntity<List<BookDTO>> getPinnedBooks() {
        return ResponseEntity.ok(bookService.getPinnedBooks());
    }

    @GetMapping("/{id}")
    public ResponseEntity<BookDTO> getBookById(@PathVariable Long id) {
        return ResponseEntity.ok(bookService.getBookById(id));
    }

    @PostMapping
    public ResponseEntity<BookDTO> createBook(@Valid @RequestBody BookRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(bookService.createBook(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<BookDTO> updateBook(
            @PathVariable Long id,
            @Valid @RequestBody BookRequest request) {
        return ResponseEntity.ok(bookService.updateBook(id, request));
    }

    @PatchMapping("/{id}/stock")
    public ResponseEntity<BookDTO> updateBookStock(
            @PathVariable Long id,
            @RequestParam Integer quantity) {
        return ResponseEntity.ok(bookService.updateBookStock(id, quantity));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBook(@PathVariable Long id) {
        bookService.deleteBook(id);
        return ResponseEntity.noContent().build();
    }
}