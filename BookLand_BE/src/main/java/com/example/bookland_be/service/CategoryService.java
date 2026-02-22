package com.example.bookland_be.service;

import com.example.bookland_be.dto.CategoryDTO;
import com.example.bookland_be.dto.PageResponse;
import com.example.bookland_be.dto.request.CategoryRequest;
import com.example.bookland_be.entity.Category;
import com.example.bookland_be.exception.AppException;
import com.example.bookland_be.exception.ErrorCode;
import com.example.bookland_be.repository.CategoryRepository;
import com.example.bookland_be.repository.specification.CategorySpecification;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;

    @Cacheable(value = "categories")
    @Transactional(readOnly = true)
    public PageResponse<CategoryDTO> getAllCategories(String keyword, Pageable pageable) {
        Specification<Category> spec = Specification.unrestricted();

        if (keyword != null && !keyword.trim().isEmpty()) {
            spec = spec.and(CategorySpecification.searchByKeyword(keyword));
        }

        return PageResponse.from(categoryRepository.findAll(spec, pageable)
                .map(this::convertToDTO));
    }

    @Cacheable(value = "category", key = "#id")
    @Transactional(readOnly = true)
    public CategoryDTO getCategoryById(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.CATEGORY_NOT_FOUND));
        return convertToDTO(category);
    }

    @CacheEvict(value = "categories", allEntries = true)
    @Transactional
    public CategoryDTO createCategory(CategoryRequest request) {
        if (categoryRepository.existsByName(request.getName())) {
            throw new AppException(ErrorCode.CATEGORY_NAME_EXISTED);
        }

        Category category = Category.builder()
                .name(request.getName())
                .description(request.getDescription())
                .build();

        Category savedCategory = categoryRepository.save(category);
        return convertToDTO(savedCategory);
    }

    @Caching(evict = {
            @CacheEvict(value = "category", key = "#id"),
            @CacheEvict(value = "categories", allEntries = true)
    })
    @Transactional
    public CategoryDTO updateCategory(Long id, CategoryRequest request) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.CATEGORY_NOT_FOUND));

        // Kiểm tra tên trùng (nếu đổi tên)
        if (!category.getName().equals(request.getName()) &&
                categoryRepository.existsByName(request.getName())) {
            throw new AppException(ErrorCode.CATEGORY_NAME_EXISTED);
        }

        category.setName(request.getName());
        category.setDescription(request.getDescription());

        Category updatedCategory = categoryRepository.save(category);
        return convertToDTO(updatedCategory);
    }

    @Caching(evict = {
            @CacheEvict(value = "category", key = "#id"),
            @CacheEvict(value = "categories", allEntries = true)
    })
    @Transactional
    public void deleteCategory(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.CATEGORY_NOT_FOUND));

        // Kiểm tra xem có sách nào đang dùng category này không
        if (!category.getBooks().isEmpty()) {
            throw new AppException(ErrorCode.CATEGORY_HAS_BOOKS);
        }

        categoryRepository.delete(category);
    }

    private CategoryDTO convertToDTO(Category category) {
        return CategoryDTO.builder()
                .id(category.getId())
                .name(category.getName())
                .description(category.getDescription())
                .bookCount(category.getBooks() != null ? category.getBooks().size() : 0)
                .build();
    }
}
