package com.example.bookland_be.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HomeSectionDTO {
    private Long id;
    private String sectionKey;
    private String nameVi;
    private String nameEn;
    private String icon;
    private String anchorId;
    private Integer displayOrder;
    private Boolean visible;
    private Integer itemLimit;
}
