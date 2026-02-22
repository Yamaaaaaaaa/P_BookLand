
// AuthorService.java
package com.example.bookland_be.service;

import com.example.bookland_be.dto.AuthorDTO;
import com.example.bookland_be.dto.PageResponse;
import com.example.bookland_be.dto.request.AuthorRequest;
import com.example.bookland_be.entity.Author;
import com.example.bookland_be.exception.AppException;
import com.example.bookland_be.exception.ErrorCode;
import com.example.bookland_be.repository.AuthorRepository;
import com.example.bookland_be.repository.specification.AuthorSpecification;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthorService {

    private final AuthorRepository authorRepository;

    @Cacheable(value = "authors")
    @Transactional(readOnly = true)
    public PageResponse<AuthorDTO> getAllAuthors(String keyword, Pageable pageable) {
        Specification<Author> spec = AuthorSpecification.searchByKeyword(keyword);

        return PageResponse.from(authorRepository.findAll(spec, pageable)
                .map(this::convertToDTO));
    }

    @Cacheable(value = "author", key = "#id")
    @Transactional(readOnly = true)
    public AuthorDTO getAuthorById(Long id) {
        Author author = authorRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.AUTHOR_NOT_FOUND));
        return convertToDTO(author);
    }

    @CacheEvict(value = "authors", allEntries = true)
    @Transactional
    public AuthorDTO createAuthor(AuthorRequest request) {
        if (authorRepository.existsByName(request.getName())) {
            throw new AppException(ErrorCode.AUTHOR_NAME_EXISTED);
        }

        Author author = Author.builder()
                .name(request.getName())
                .description(request.getDescription())
                .authorImage(request.getAuthorImage())
                .build();

        Author savedAuthor = authorRepository.save(author);
        return convertToDTO(savedAuthor);
    }

    @Caching(evict = {
            @CacheEvict(value = "author", key = "#id"),
            @CacheEvict(value = "authors", allEntries = true)
    })
    @Transactional
    public AuthorDTO updateAuthor(Long id, AuthorRequest request) {
        Author author = authorRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.AUTHOR_NOT_FOUND));

        if (!author.getName().equals(request.getName()) &&
                authorRepository.existsByName(request.getName())) {
            throw new AppException(ErrorCode.AUTHOR_NAME_EXISTED);
        }

        author.setName(request.getName());
        author.setDescription(request.getDescription());
        author.setAuthorImage(request.getAuthorImage());

        Author updatedAuthor = authorRepository.save(author);
        return convertToDTO(updatedAuthor);
    }

    @Caching(evict = {
            @CacheEvict(value = "author", key = "#id"),
            @CacheEvict(value = "authors", allEntries = true)
    })
    @Transactional
    public void deleteAuthor(Long id) {
        Author author = authorRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.AUTHOR_NOT_FOUND));

        if (!author.getBooks().isEmpty()) {
            throw new AppException(ErrorCode.AUTHOR_HAS_BOOKS);
        }

        authorRepository.delete(author);
    }

    private AuthorDTO convertToDTO(Author author) {
        return AuthorDTO.builder()
                .id(author.getId())
                .name(author.getName())
                .description(author.getDescription())
                .authorImage(author.getAuthorImage())
                .build();
    }
}