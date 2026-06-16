package com.example.bookland_be.service;

import com.example.bookland_be.dto.HomeSectionDTO;
import com.example.bookland_be.dto.request.HomeSectionConfigRequest;
import com.example.bookland_be.entity.HomeSection;
import com.example.bookland_be.repository.HomeSectionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class HomeSectionService {

    private final HomeSectionRepository homeSectionRepository;

    @Cacheable(value = "homeSections")
    @Transactional(readOnly = true)
    public List<HomeSectionDTO> getHomeSections() {
        return homeSectionRepository.findAllByOrderByDisplayOrderAsc()
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @CacheEvict(value = "homeSections", allEntries = true)
    @Transactional
    public List<HomeSectionDTO> updateSectionsOrder(List<Long> sectionIds) {
        Map<Long, HomeSection> sectionMap = homeSectionRepository.findAll()
                .stream()
                .collect(Collectors.toMap(HomeSection::getId, s -> s));

        for (int i = 0; i < sectionIds.size(); i++) {
            Long id = sectionIds.get(i);
            HomeSection section = sectionMap.get(id);
            if (section != null) {
                section.setDisplayOrder(i + 1);
                homeSectionRepository.save(section);
            }
        }

        log.info("Updated home section order: {}", sectionIds);
        return homeSectionRepository.findAllByOrderByDisplayOrderAsc()
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @CacheEvict(value = "homeSections", allEntries = true)
    @Transactional
    public List<HomeSectionDTO> toggleVisibility(Long id, boolean visible) {
        HomeSection section = homeSectionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("HomeSection not found with id: " + id));
        section.setVisible(visible);
        homeSectionRepository.save(section);
        log.info("Toggled visibility for section id={} to visible={}", id, visible);

        return homeSectionRepository.findAllByOrderByDisplayOrderAsc()
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @CacheEvict(value = "homeSections", allEntries = true)
    @Transactional
    public List<HomeSectionDTO> bulkUpdateConfig(List<HomeSectionConfigRequest> requests) {
        Map<Long, HomeSection> sectionMap = homeSectionRepository.findAll()
                .stream()
                .collect(Collectors.toMap(HomeSection::getId, s -> s));

        for (HomeSectionConfigRequest req : requests) {
            HomeSection section = sectionMap.get(req.getId());
            if (section != null) {
                if (req.getDisplayOrder() != null) section.setDisplayOrder(req.getDisplayOrder());
                if (req.getVisible() != null) section.setVisible(req.getVisible());
                if (req.getItemLimit() != null) section.setItemLimit(req.getItemLimit());
                homeSectionRepository.save(section);
            }
        }

        log.info("Bulk updated home section configs");
        return homeSectionRepository.findAllByOrderByDisplayOrderAsc()
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @CacheEvict(value = "homeSections", allEntries = true)
    @Transactional
    public List<HomeSectionDTO> resetToDefault() {
        List<HomeSection> sections = homeSectionRepository.findAllByOrderByDisplayOrderAsc();
        String[] defaultOrder = {"super_sale", "trending", "featured", "best_seller", "recommend"};

        Map<String, HomeSection> sectionMap = sections.stream()
                .collect(Collectors.toMap(HomeSection::getSectionKey, s -> s));

        for (int i = 0; i < defaultOrder.length; i++) {
            HomeSection section = sectionMap.get(defaultOrder[i]);
            if (section != null) {
                section.setDisplayOrder(i + 1);
                section.setVisible(true);
                section.setItemLimit(5);
                homeSectionRepository.save(section);
            }
        }

        log.info("Reset home sections to default order");
        return homeSectionRepository.findAllByOrderByDisplayOrderAsc()
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    private HomeSectionDTO convertToDTO(HomeSection section) {
        return HomeSectionDTO.builder()
                .id(section.getId())
                .sectionKey(section.getSectionKey())
                .nameVi(section.getNameVi())
                .nameEn(section.getNameEn())
                .icon(section.getIcon())
                .anchorId(section.getAnchorId())
                .displayOrder(section.getDisplayOrder())
                .visible(section.getVisible())
                .itemLimit(section.getItemLimit())
                .build();
    }
}
