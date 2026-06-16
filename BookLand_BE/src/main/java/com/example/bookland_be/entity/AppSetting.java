package com.example.bookland_be.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.*;

@Entity
@Table(name = "app_setting")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AppSetting {
    
    @Id
    @Column(name = "setting_key", nullable = false)
    private String settingKey;

    @Column(name = "setting_value", columnDefinition = "TEXT")
    private String settingValue;
}
