// SerieService.java
package com.example.bookland_be.service;

import com.example.bookland_be.dto.PageResponse;
import com.example.bookland_be.dto.SerieDTO;
import com.example.bookland_be.dto.request.SerieRequest;
import com.example.bookland_be.entity.Serie;
import com.example.bookland_be.exception.AppException;
import com.example.bookland_be.exception.ErrorCode;
import com.example.bookland_be.repository.SerieRepository;
import com.example.bookland_be.repository.specification.SerieSpecification;
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
public class SerieService {

    private final SerieRepository serieRepository;

    @Cacheable(value = "series")
    @Transactional(readOnly = true)
    public PageResponse<SerieDTO> getAllSeries(String keyword, Pageable pageable) {
        Specification<Serie> spec = SerieSpecification.searchByKeyword(keyword);

        return PageResponse.from(serieRepository.findAll(spec, pageable)
                .map(this::convertToDTO));
    }

    @Cacheable(value = "serie", key = "#id")
    @Transactional(readOnly = true)
    public SerieDTO getSerieById(Long id) {
        Serie serie = serieRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.SERIE_NOT_FOUND));
        return convertToDTO(serie);
    }

    @CacheEvict(value = "series", allEntries = true)
    @Transactional
    public SerieDTO createSerie(SerieRequest request) {
        if (serieRepository.existsByName(request.getName())) {
            throw new AppException(ErrorCode.SERIE_NAME_EXISTED);
        }

        Serie serie = Serie.builder()
                .name(request.getName())
                .description(request.getDescription())
                .build();

        Serie savedSerie = serieRepository.save(serie);
        return convertToDTO(savedSerie);
    }

    @Caching(evict = {
            @CacheEvict(value = "serie", key = "#id"),
            @CacheEvict(value = "series", allEntries = true)
    })
    @Transactional
    public SerieDTO updateSerie(Long id, SerieRequest request) {
        Serie serie = serieRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.SERIE_NOT_FOUND));

        if (!serie.getName().equals(request.getName()) &&
                serieRepository.existsByName(request.getName())) {
            throw new AppException(ErrorCode.SERIE_NAME_EXISTED);
        }

        serie.setName(request.getName());
        serie.setDescription(request.getDescription());

        Serie updatedSerie = serieRepository.save(serie);
        return convertToDTO(updatedSerie);
    }

    @Caching(evict = {
            @CacheEvict(value = "serie", key = "#id"),
            @CacheEvict(value = "series", allEntries = true)
    })
    @Transactional
    public void deleteSerie(Long id) {
        Serie serie = serieRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.SERIE_NOT_FOUND));

        if (!serie.getBooks().isEmpty()) {
            throw new AppException(ErrorCode.SERIE_HAS_BOOKS);
        }

        serieRepository.delete(serie);
    }

    private SerieDTO convertToDTO(Serie serie) {
        return SerieDTO.builder()
                .id(serie.getId())
                .name(serie.getName())
                .description(serie.getDescription())
                .build();
    }
}