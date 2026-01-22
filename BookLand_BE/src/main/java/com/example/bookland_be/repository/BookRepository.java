package com.example.bookland_be.repository;

import com.example.bookland_be.entity.Book;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BookRepository extends JpaRepository<Book, Long> {
    List<Book> findByStatus(Book.BookStatus status);
    List<Book> findByAuthorId(Long authorId);
    List<Book> findByPublisherId(Long publisherId);
    List<Book> findBySeriesId(Long seriesId);
    List<Book> findByPinTrue();
}
