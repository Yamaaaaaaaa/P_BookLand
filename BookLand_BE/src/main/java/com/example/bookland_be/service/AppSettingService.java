package com.example.bookland_be.service;

import com.example.bookland_be.entity.AppSetting;
import com.example.bookland_be.repository.AppSettingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AppSettingService {
    private final AppSettingRepository appSettingRepository;

    public Map<String, String> getAllSettings() {
        return appSettingRepository.findAll().stream()
                .collect(Collectors.toMap(AppSetting::getSettingKey, AppSetting::getSettingValue));
    }

    @Transactional
    public void saveSettings(Map<String, String> settings) {
        List<AppSetting> entities = settings.entrySet().stream()
                .map(entry -> AppSetting.builder()
                        .settingKey(entry.getKey())
                        .settingValue(entry.getValue())
                        .build())
                .collect(Collectors.toList());
        appSettingRepository.saveAll(entities);
    }
}
