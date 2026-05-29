package com.example.bookland_be.enums;

public enum EventTargetType {
    // Sản phẩm
    BOOK("Áp dụng cho sách cụ thể"),

    // Phân loại
    CATEGORY("Áp dụng cho danh mục"),
    SERIES("Áp dụng cho bộ sách trong 1 Serie"),
    AUTHOR("Áp dụng cho tác giả"),
    PUBLISHER("Áp dụng cho nhà xuất bản"),

    // Khác
    ALL("Áp dụng cho tất cả");

    private final String description;

    EventTargetType(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}