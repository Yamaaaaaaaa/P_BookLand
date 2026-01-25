package com.example.bookland_be.service;

import com.example.bookland_be.dto.BookDTO;
import com.example.bookland_be.dto.request.BookRequest;
import com.example.bookland_be.entity.*;
import com.example.bookland_be.entity.Book.BookStatus;
import com.example.bookland_be.repository.*;
import com.example.bookland_be.repository.specification.BookSpecification;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BookService {
    private final BookRepository bookRepository;
    private final AuthorRepository authorRepository;
    private final PublisherRepository publisherRepository;
    private final SerieRepository serieRepository;
    private final CategoryRepository categoryRepository;

    @Transactional(readOnly = true)
    public Page<BookDTO> getAllBooks(String keyword, BookStatus status, Long authorId,
                                     Long publisherId, Long seriesId, Long categoryId,
                                     Boolean pinned, Double minPrice, Double maxPrice,
                                     Pageable pageable) {
        Specification<Book> spec = BookSpecification.searchByKeyword(keyword)
                .and(BookSpecification.hasStatus(status))
                .and(BookSpecification.hasAuthor(authorId))
                .and(BookSpecification.hasPublisher(publisherId))
                .and(BookSpecification.hasSeries(seriesId))
                .and(BookSpecification.hasCategory(categoryId))
                .and(BookSpecification.isPinned(pinned))
                .and(BookSpecification.priceBetween(minPrice, maxPrice));

        return bookRepository.findAll(spec, pageable)
                .map(this::convertToDTO);
    }

    @Transactional(readOnly = true)
    public BookDTO getBookById(Long id) {
        Book book = bookRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Book not found with id: " + id));
        return convertToDTO(book);
    }

    @Transactional
    public BookDTO createBook(BookRequest request) {
        Author author = authorRepository.findById(request.getAuthorId())
                .orElseThrow(() -> new RuntimeException("Author not found"));

        Publisher publisher = publisherRepository.findById(request.getPublisherId())
                .orElseThrow(() -> new RuntimeException("Publisher not found"));

        Serie series = null;
        if (request.getSeriesId() != null) {
            series = serieRepository.findById(request.getSeriesId())
                    .orElseThrow(() -> new RuntimeException("Series not found"));
        }

        Set<Category> categories = new HashSet<>();
        if (request.getCategoryIds() != null && !request.getCategoryIds().isEmpty()) {
            categories = request.getCategoryIds().stream()
                    .map(id -> categoryRepository.findById(id)
                            .orElseThrow(() -> new RuntimeException("Category not found: " + id)))
                    .collect(Collectors.toSet());
        }

        Book book = Book.builder()
                .name(request.getName())
                .description(request.getDescription())
                .originalCost(request.getOriginalCost())
                .sale(request.getSale() != null ? request.getSale() : 0.0)
                .stock(request.getStock() != null ? request.getStock() : 0)
                .status(request.getStatus() != null ? request.getStatus() : BookStatus.ENABLE)
                .publishedDate(request.getPublishedDate())
                .bookImageUrl(request.getBookImageUrl())
                .pin(request.getPin() != null ? request.getPin() : false)
                .author(author)
                .publisher(publisher)
                .series(series)
                .categories(categories)
                .build();

        Book savedBook = bookRepository.save(book);
        return convertToDTO(savedBook);
    }

    @Transactional
    public BookDTO updateBook(Long id, BookRequest request) {
        Book book = bookRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Book not found with id: " + id));

        Author author = authorRepository.findById(request.getAuthorId())
                .orElseThrow(() -> new RuntimeException("Author not found"));

        Publisher publisher = publisherRepository.findById(request.getPublisherId())
                .orElseThrow(() -> new RuntimeException("Publisher not found"));

        Serie series = null;
        if (request.getSeriesId() != null) {
            series = serieRepository.findById(request.getSeriesId())
                    .orElseThrow(() -> new RuntimeException("Series not found"));
        }

        Set<Category> categories = new HashSet<>();
        if (request.getCategoryIds() != null && !request.getCategoryIds().isEmpty()) {
            categories = request.getCategoryIds().stream()
                    .map(catId -> categoryRepository.findById(catId)
                            .orElseThrow(() -> new RuntimeException("Category not found: " + catId)))
                    .collect(Collectors.toSet());
        }

        book.setName(request.getName());
        book.setDescription(request.getDescription());
        book.setOriginalCost(request.getOriginalCost());
        book.setSale(request.getSale() != null ? request.getSale() : 0.0);
        book.setStock(request.getStock() != null ? request.getStock() : book.getStock());
        book.setStatus(request.getStatus() != null ? request.getStatus() : book.getStatus());
        book.setPublishedDate(request.getPublishedDate());
        book.setBookImageUrl(request.getBookImageUrl());
        book.setPin(request.getPin() != null ? request.getPin() : book.getPin());
        book.setAuthor(author);
        book.setPublisher(publisher);
        book.setSeries(series);
        book.getCategories().clear();
        book.getCategories().addAll(categories);

        Book updatedBook = bookRepository.save(book);
        return convertToDTO(updatedBook);
    }

    @Transactional
    public void deleteBook(Long id) {
        Book book = bookRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Book not found with id: " + id));

        if (!book.getBillBooks().isEmpty()) {
            throw new RuntimeException("Cannot delete book with existing orders");
        }

        bookRepository.delete(book);
    }

    @Transactional
    public BookDTO updateBookStock(Long id, Integer quantity) {
        Book book = bookRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Book not found with id: " + id));

        book.setStock(quantity);
        Book updatedBook = bookRepository.save(book);
        return convertToDTO(updatedBook);
    }

    private BookDTO convertToDTO(Book book) {
        return BookDTO.builder()
                .id(book.getId())
                .name(book.getName())
                .description(book.getDescription())
                .originalCost(book.getOriginalCost())
                .sale(book.getSale())
                .finalPrice(book.getFinalPrice())
                .stock(book.getStock())
                .status(book.getStatus())
                .publishedDate(book.getPublishedDate())
                .bookImageUrl(book.getBookImageUrl())
                .pin(book.getPin())
                .authorId(book.getAuthor().getId())
                .authorName(book.getAuthor().getName())
                .publisherId(book.getPublisher().getId())
                .publisherName(book.getPublisher().getName())
                .seriesId(book.getSeries() != null ? book.getSeries().getId() : null)
                .seriesName(book.getSeries() != null ? book.getSeries().getName() : null)
                .categoryIds(book.getCategories().stream()
                        .map(Category::getId)
                        .collect(Collectors.toSet()))
                .createdAt(book.getCreatedAt())
                .updatedAt(book.getUpdatedAt())
                .build();
    }
}