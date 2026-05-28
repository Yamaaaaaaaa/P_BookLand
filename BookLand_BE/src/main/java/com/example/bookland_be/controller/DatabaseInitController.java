package com.example.bookland_be.controller;

import com.example.bookland_be.dto.response.ApiResponse;
import com.example.bookland_be.service.DatabaseInitService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/init")
@RequiredArgsConstructor
public class DatabaseInitController {

    private final DatabaseInitService databaseInitService;

    @PostMapping("/seed-data")
    public ApiResponse<String> seedData() {
        String result = databaseInitService.seedData();
        return ApiResponse.<String>builder()
                .result(result)
                .build();
    }

    @PostMapping("/clear-data")
    public ApiResponse<String> clearData() {
        String result = databaseInitService.clearData();
        return ApiResponse.<String>builder()
                .result(result)
                .build();
    }
}
