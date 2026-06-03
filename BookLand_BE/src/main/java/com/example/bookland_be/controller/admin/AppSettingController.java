package com.example.bookland_be.controller.admin;

import com.example.bookland_be.dto.response.ApiResponse;
import com.example.bookland_be.service.AppSettingService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/settings")
@RequiredArgsConstructor
public class AppSettingController {

    private final AppSettingService appSettingService;

    @GetMapping
    public ApiResponse<Map<String, String>> getAllSettings() {
        return ApiResponse.<Map<String, String>>builder()
                .result(appSettingService.getAllSettings())
                .build();
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<String> saveSettings(@RequestBody Map<String, String> settings) {
        appSettingService.saveSettings(settings);
        return ApiResponse.<String>builder()
                .result("Cập nhật cài đặt thành công")
                .build();
    }
}
