package com.example.bookland_be.controller.common;

import com.example.bookland_be.dto.response.ApiResponse;
import com.example.bookland_be.service.AppSettingService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/settings")
@RequiredArgsConstructor
public class PublicAppSettingController {

    private final AppSettingService appSettingService;

    @GetMapping
    public ApiResponse<Map<String, String>> getAllSettings() {
        return ApiResponse.<Map<String, String>>builder()
                .result(appSettingService.getAllSettings())
                .build();
    }
}
