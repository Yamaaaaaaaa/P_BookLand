package com.example.bookland_be.service;

import com.example.bookland_be.dto.SerieDTO;
import com.example.bookland_be.dto.request.SerieRequest;
import com.example.bookland_be.entity.Serie;
import com.example.bookland_be.repository.SerieRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SerieService {

    private final SerieRepository serieRepository;

    public List<SerieDTO> getAllSeries() {
        return serieRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public SerieDTO getSerieById(Long id) {
        Serie serie = serieRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Series not found with id: " + id));
        return convertToDTO(serie);
    }

    @Transactional
    public SerieDTO createSerie(SerieRequest request) {
        if (serieRepository.existsByName(request.getName())) {
            throw new RuntimeException("Series name already exists: " + request.getName());
        }

        Serie serie = Serie.builder()
                .name(request.getName())
                .description(request.getDescription())
                .build();

        Serie savedSerie = serieRepository.save(serie);
        return convertToDTO(savedSerie);
    }

    @Transactional
    public SerieDTO updateSerie(Long id, SerieRequest request) {
        Serie serie = serieRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Series not found with id: " + id));

        if (!serie.getName().equals(request.getName()) &&
                serieRepository.existsByName(request.getName())) {
            throw new RuntimeException("Series name already exists: " + request.getName());
        }

        serie.setName(request.getName());
        serie.setDescription(request.getDescription());

        Serie updatedSerie = serieRepository.save(serie);
        return convertToDTO(updatedSerie);
    }

    @Transactional
    public void deleteSerie(Long id) {
        Serie serie = serieRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Series not found with id: " + id));

        if (!serie.getBooks().isEmpty()) {
            throw new RuntimeException("Cannot delete series with existing books");
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