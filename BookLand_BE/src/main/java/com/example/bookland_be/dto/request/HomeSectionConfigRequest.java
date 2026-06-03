package com.example.bookland_be.dto.request;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HomeSectionConfigRequest {
    private Long id;
    private Integer displayOrder;
    private Boolean visible;
    private Integer itemLimit;
}
