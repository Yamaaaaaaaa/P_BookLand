package com.example.bookland_be.controller.common;

import com.example.bookland_be.dto.PublisherDTO;
import com.example.bookland_be.dto.request.PublisherRequest;
import com.example.bookland_be.dto.response.ApiResponse;
import com.example.bookland_be.service.PublisherService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/publishers")
@RequiredArgsConstructor
@SecurityRequirement(name = "BearerAuth")
public class PublisherController {

    private final PublisherService publisherService;

    @GetMapping
    public ApiResponse<Page<PublisherDTO>> getAllPublishers(
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

        Page<PublisherDTO> publishers = publisherService.getAllPublishers(keyword, pageable);
        return ApiResponse.<Page<PublisherDTO>>builder().result(publishers).build();
    }

    @GetMapping("/{id}")
    public ApiResponse<PublisherDTO> getPublisherById(@PathVariable Long id) {
        return ApiResponse.<PublisherDTO>builder().result(publisherService.getPublisherById(id)).build();
    }

    @PostMapping
    public ApiResponse<PublisherDTO> createPublisher(@Valid @RequestBody PublisherRequest request) {
        return ApiResponse.<PublisherDTO>builder().result(publisherService.createPublisher(request)).build();
    }

    @PutMapping("/{id}")
    public ApiResponse<PublisherDTO> updatePublisher(
            @PathVariable Long id,
            @Valid @RequestBody PublisherRequest request) {
        return ApiResponse.<PublisherDTO>builder().result(publisherService.updatePublisher(id, request)).build();
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> deletePublisher(@PathVariable Long id) {
        publisherService.deletePublisher(id);
        return ApiResponse.<Void>builder().build();
    }
}
