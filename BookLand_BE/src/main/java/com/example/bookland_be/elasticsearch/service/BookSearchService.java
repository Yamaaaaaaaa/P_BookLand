package com.example.bookland_be.elasticsearch.service;

import com.example.bookland_be.elasticsearch.document.BookDocument;
import com.example.bookland_be.elasticsearch.repository.BookElasticsearchRepository;
import com.example.bookland_be.entity.Book;
import com.example.bookland_be.entity.Category;
import com.example.bookland_be.repository.BookRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.elasticsearch.client.elc.NativeQuery;
import org.springframework.data.elasticsearch.core.ElasticsearchOperations;
import org.springframework.data.elasticsearch.core.SearchHit;
import org.springframework.data.elasticsearch.core.SearchHits;
import org.springframework.data.elasticsearch.core.query.Query;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import co.elastic.clients.elasticsearch._types.query_dsl.QueryBuilders;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BookSearchService {

    private final BookElasticsearchRepository bookElasticsearchRepository;
    private final BookRepository bookRepository;
    private final ElasticsearchOperations elasticsearchOperations;

    @Transactional(readOnly = true)
    public void indexBook(Book book) {
        bookElasticsearchRepository.save(convertToDocument(book));
    }

    public void deleteBook(Long id) {
        bookElasticsearchRepository.deleteById(id.toString());
    }

    @Transactional(readOnly = true)
    public void syncAllBooks() {
        bookElasticsearchRepository.deleteAll();
        List<Book> books = bookRepository.findAll();
        List<BookDocument> docs = books.stream()
                .map(this::convertToDocument)
                .collect(Collectors.toList());
        bookElasticsearchRepository.saveAll(docs);
    }

    public Page<BookDocument> searchBooks(String keyword, Pageable pageable) {
        co.elastic.clients.elasticsearch._types.query_dsl.Query esQuery;

        if (keyword == null || keyword.trim().isEmpty()) {
            // Trả toàn bộ sách nếu không có keyword
            esQuery = QueryBuilders.matchAll().build()._toQuery();
        } else {
            // Tìm kiếm toàn văn với sửa lỗi chính tả tự động
            esQuery = QueryBuilders.multiMatch()
                    .query(keyword)
                    .fields("name", "description", "authorName", "publisherName")
                    .fuzziness("AUTO")
                    .build()
                    ._toQuery();
        }

        Query query = NativeQuery.builder()
                .withQuery(esQuery)
                .withPageable(pageable)
                .build();

        SearchHits<BookDocument> hits = elasticsearchOperations.search(query, BookDocument.class);
        List<BookDocument> results = hits.getSearchHits()
                .stream()
                .map(SearchHit::getContent)
                .collect(Collectors.toList());

        return new PageImpl<>(results, pageable, hits.getTotalHits());
    }

    private BookDocument convertToDocument(Book book) {
        Set<String> categoryNames = book.getCategories() != null
                ? book.getCategories().stream().map(Category::getName).collect(Collectors.toSet())
                : Set.of();

        return BookDocument.builder()
                .id(book.getId().toString())
                .name(book.getName())
                .description(book.getDescription())
                .originalCost(book.getOriginalCost())
                .sale(book.getSale())
                .finalPrice(book.getFinalPrice())
                .stock(book.getStock())
                .status(book.getStatus() != null ? book.getStatus().name() : null)
                .bookImageUrl(book.getBookImageUrl())
                .authorName(book.getAuthor() != null ? book.getAuthor().getName() : null)
                .publisherName(book.getPublisher() != null ? book.getPublisher().getName() : null)
                .categories(categoryNames)
                .build();
    }
}
