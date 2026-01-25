package com.example.bookland_be.dto;

import com.example.bookland_be.entity.EventImage;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EventImageDTO {
    private Long id;
    private String imageUrl;
    private EventImage.ImageType imageType;
}
