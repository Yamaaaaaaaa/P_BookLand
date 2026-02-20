package com.example.bookland_be.service;

import com.example.bookland_be.dto.BookDTO;
import com.example.bookland_be.dto.request.BookRequest;
import com.example.bookland_be.entity.*;
import com.example.bookland_be.entity.Book.BookStatus;
import com.example.bookland_be.exception.AppException;
import com.example.bookland_be.exception.ErrorCode;
import com.example.bookland_be.repository.*;
import com.example.bookland_be.dto.enums.BestSellerPeriod;
import com.example.bookland_be.repository.specification.BookSpecification;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
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
    public Page<BookDTO> getAllBooks(String keyword, BookStatus status, java.util.List<Long> authorIds,
                                     java.util.List<Long> publisherIds, java.util.List<Long> seriesIds, java.util.List<Long> categoryIds,
                                     Boolean pinned, Double minPrice, Double maxPrice,
                                     Pageable pageable) {
        Specification<Book> spec = BookSpecification.searchByKeyword(keyword)
                .and(BookSpecification.hasStatus(status))
                .and(BookSpecification.hasAuthors(authorIds))
                .and(BookSpecification.hasPublishers(publisherIds))
                .and(BookSpecification.hasSeries(seriesIds))
                .and(BookSpecification.hasCategories(categoryIds))
                .and(BookSpecification.isPinned(pinned))
                .and(BookSpecification.priceBetween(minPrice, maxPrice));

        return bookRepository.findAll(spec, pageable)
                .map(this::convertToDTO);
    }

    @Transactional(readOnly = true)
    public Page<BookDTO> getBestSellingBooks(BestSellerPeriod period,
                                             String keyword, Double minPrice, Double maxPrice,
                                             java.util.List<Long> categoryIds,
                                             java.util.List<Long> authorIds,
                                             java.util.List<Long> publisherIds,
                                             java.util.List<Long> seriesIds,
                                             Pageable pageable) {
        java.time.LocalDateTime startDate = null;
        if (period != null) {
            switch (period) {
                case WEEK:
                    startDate = java.time.LocalDateTime.now().minusWeeks(1);
                    break;
                case MONTH:
                    startDate = java.time.LocalDateTime.now().minusMonths(1);
                    break;
                case YEAR:
                    startDate = java.time.LocalDateTime.now().minusYears(1);
                    break;
                case ALL:
                default:
                    startDate = null;
            }
        }

        return bookRepository.findBestSellingBooks(keyword, minPrice, maxPrice, startDate, categoryIds, authorIds, publisherIds, seriesIds, pageable)
                .map(this::convertToDTO);
    }

    @Cacheable(value = "books", key = "#id")
    @Transactional(readOnly = true)
    public BookDTO getBookById(Long id) {
        Book book = bookRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.BOOK_NOT_FOUND));
        return convertToDTO(book);
    }

    @Transactional
    public BookDTO createBook(BookRequest request) {
        Author author = authorRepository.findById(request.getAuthorId())
                .orElseThrow(() -> new AppException(ErrorCode.AUTHOR_NOT_FOUND));

        Publisher publisher = publisherRepository.findById(request.getPublisherId())
                .orElseThrow(() -> new AppException(ErrorCode.PUBLISHER_NOT_FOUND));

        Serie series = null;
        if (request.getSeriesId() != null) {
            series = serieRepository.findById(request.getSeriesId())
                    .orElseThrow(() -> new AppException(ErrorCode.SERIE_NOT_FOUND));
        }

        Set<Category> categories = new HashSet<>();
        if (request.getCategoryIds() != null && !request.getCategoryIds().isEmpty()) {
            categories = request.getCategoryIds().stream()
                    .map(id -> categoryRepository.findById(id)
                            .orElseThrow(() -> new AppException(ErrorCode.CATEGORY_NOT_FOUND)))
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
                .orElseThrow(() -> new AppException(ErrorCode.BOOK_NOT_FOUND));

        Author author = authorRepository.findById(request.getAuthorId())
                .orElseThrow(() -> new AppException(ErrorCode.AUTHOR_NOT_FOUND));

        Publisher publisher = publisherRepository.findById(request.getPublisherId())
                .orElseThrow(() -> new AppException(ErrorCode.PUBLISHER_NOT_FOUND));

        Serie series = null;
        if (request.getSeriesId() != null) {
            series = serieRepository.findById(request.getSeriesId())
                    .orElseThrow(() -> new AppException(ErrorCode.SERIE_NOT_FOUND));
        }

        Set<Category> categories = new HashSet<>();
        if (request.getCategoryIds() != null && !request.getCategoryIds().isEmpty()) {
            categories = request.getCategoryIds().stream()
                    .map(catId -> categoryRepository.findById(catId)
                            .orElseThrow(() -> new AppException(ErrorCode.CATEGORY_NOT_FOUND)))
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
                .orElseThrow(() -> new AppException(ErrorCode.BOOK_NOT_FOUND));

        if (!book.getBillBooks().isEmpty()) {
            throw new AppException(ErrorCode.BOOK_HAS_ORDERS);
        }

        bookRepository.delete(book);
    }

    @Transactional
    public BookDTO updateBookStock(Long id, Integer quantity) {
        Book book = bookRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.BOOK_NOT_FOUND));

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