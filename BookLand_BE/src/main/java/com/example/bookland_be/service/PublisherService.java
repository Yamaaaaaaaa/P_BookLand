
// PublisherService.java
package com.example.bookland_be.service;

import com.example.bookland_be.dto.PublisherDTO;
import com.example.bookland_be.dto.request.PublisherRequest;
import com.example.bookland_be.entity.Publisher;
import com.example.bookland_be.exception.AppException;
import com.example.bookland_be.exception.ErrorCode;
import com.example.bookland_be.repository.PublisherRepository;
import com.example.bookland_be.repository.specification.PublisherSpecification;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class PublisherService {

    private final PublisherRepository publisherRepository;

    @Transactional(readOnly = true)
    public Page<PublisherDTO> getAllPublishers(String keyword, Pageable pageable) {
        Specification<Publisher> spec = PublisherSpecification.searchByKeyword(keyword);

        return publisherRepository.findAll(spec, pageable)
                .map(this::convertToDTO);
    }

    @Transactional(readOnly = true)
    public PublisherDTO getPublisherById(Long id) {
        Publisher publisher = publisherRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.PUBLISHER_NOT_FOUND));
        return convertToDTO(publisher);
    }

    @Transactional
    public PublisherDTO createPublisher(PublisherRequest request) {
        if (publisherRepository.existsByName(request.getName())) {
            throw new AppException(ErrorCode.PUBLISHER_NAME_EXISTED);
        }

        Publisher publisher = Publisher.builder()
                .name(request.getName())
                .description(request.getDescription())
                .build();

        Publisher savedPublisher = publisherRepository.save(publisher);
        return convertToDTO(savedPublisher);
    }

    @Transactional
    public PublisherDTO updatePublisher(Long id, PublisherRequest request) {
        Publisher publisher = publisherRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.PUBLISHER_NOT_FOUND));

        if (!publisher.getName().equals(request.getName()) &&
                publisherRepository.existsByName(request.getName())) {
            throw new AppException(ErrorCode.PUBLISHER_NAME_EXISTED);
        }

        publisher.setName(request.getName());
        publisher.setDescription(request.getDescription());

        Publisher updatedPublisher = publisherRepository.save(publisher);
        return convertToDTO(updatedPublisher);
    }

    @Transactional
    public void deletePublisher(Long id) {
        Publisher publisher = publisherRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.PUBLISHER_NOT_FOUND));

        if (!publisher.getBooks().isEmpty()) {
            throw new AppException(ErrorCode.PUBLISHER_HAS_BOOKS);
        }

        publisherRepository.delete(publisher);
    }

    private PublisherDTO convertToDTO(Publisher publisher) {
        return PublisherDTO.builder()
                .id(publisher.getId())
                .name(publisher.getName())
                .description(publisher.getDescription())
                .build();
    }
}