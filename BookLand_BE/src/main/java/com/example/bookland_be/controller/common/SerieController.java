
// SerieController.java
package com.example.bookland_be.controller.common;

import com.example.bookland_be.dto.SerieDTO;
import com.example.bookland_be.dto.request.SerieRequest;
import com.example.bookland_be.dto.response.ApiResponse;
import com.example.bookland_be.service.SerieService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/series")
@RequiredArgsConstructor
@SecurityRequirement(name = "BearerAuth")
public class SerieController {

    private final SerieService serieService;

    @GetMapping
    public ApiResponse<Page<SerieDTO>> getAllSeries(
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDirection
    ) {
        Sort.Direction direction = sortDirection.equalsIgnoreCase("ASC")
                ? Sort.Direction.ASC
                : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));

        Page<SerieDTO> series = serieService.getAllSeries(keyword, pageable);
        return ApiResponse.<Page<SerieDTO>>builder().result(series).build();
    }

    @GetMapping("/{id}")
    public ApiResponse<SerieDTO> getSerieById(@PathVariable Long id) {
        return ApiResponse.<SerieDTO>builder().result(serieService.getSerieById(id)).build();
    }

    @PostMapping
    public ApiResponse<SerieDTO> createSerie(@Valid @RequestBody SerieRequest request) {
        return ApiResponse.<SerieDTO>builder().result(serieService.createSerie(request)).build();
    }

    @PutMapping("/{id}")
    public ApiResponse<SerieDTO> updateSerie(
            @PathVariable Long id,
            @Valid @RequestBody SerieRequest request) {
        return ApiResponse.<SerieDTO>builder().result(serieService.updateSerie(id, request)).build();
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteSerie(@PathVariable Long id) {
        serieService.deleteSerie(id);
        return ApiResponse.<Void>builder().build();
    }
}