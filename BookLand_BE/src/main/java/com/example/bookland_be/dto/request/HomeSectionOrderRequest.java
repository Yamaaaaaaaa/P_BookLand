package com.example.bookland_be.dto.request;

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HomeSectionOrderRequest {
    private List<Long> sectionIds;
}
