package com.example.bookland_be.controller.common;


import com.example.bookland_be.dto.SerieDTO;
import com.example.bookland_be.dto.request.SerieRequest;
import com.example.bookland_be.service.SerieService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/series")
@RequiredArgsConstructor
@SecurityRequirement(name = "BearerAuth")
public class SerieController {

    private final SerieService serieService;

    @GetMapping
    public ResponseEntity<List<SerieDTO>> getAllSeries() {
        return ResponseEntity.ok(serieService.getAllSeries());
    }

    @GetMapping("/{id}")
    public ResponseEntity<SerieDTO> getSerieById(@PathVariable Long id) {
        return ResponseEntity.ok(serieService.getSerieById(id));
    }

    @PostMapping
    public ResponseEntity<SerieDTO> createSerie(@Valid @RequestBody SerieRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(serieService.createSerie(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<SerieDTO> updateSerie(
            @PathVariable Long id,
            @Valid @RequestBody SerieRequest request) {
        return ResponseEntity.ok(serieService.updateSerie(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSerie(@PathVariable Long id) {
        serieService.deleteSerie(id);
        return ResponseEntity.noContent().build();
    }
}