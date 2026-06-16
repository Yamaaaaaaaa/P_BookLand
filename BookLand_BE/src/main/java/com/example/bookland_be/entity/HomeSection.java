package com.example.bookland_be.entity;

import lombok.*;
import jakarta.persistence.*;

@Entity
@Table(name = "home_section")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HomeSection {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "section_key", unique = true, nullable = false)
    private String sectionKey;

    @Column(name = "name_vi", nullable = false)
    private String nameVi;

    @Column(name = "name_en", nullable = false)
    private String nameEn;

    @Column(name = "icon")
    private String icon;

    @Column(name = "anchor_id")
    private String anchorId;

    @Column(name = "display_order", nullable = false)
    private Integer displayOrder;

    @Column(name = "visible", nullable = false)
    private Boolean visible = true;

    @Column(name = "item_limit", nullable = false)
    @Builder.Default
    private Integer itemLimit = 5;
}
