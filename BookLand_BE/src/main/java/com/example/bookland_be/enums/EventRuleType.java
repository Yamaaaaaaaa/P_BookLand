package com.example.bookland_be.enums;

public enum EventRuleType {
    // Giá trị đơn hàng
    MIN_ORDER_VALUE("Giá trị đơn tối thiểu (VNĐ)"),
    MAX_ORDER_VALUE("Giá trị đơn tối đa (VNĐ)"),

    // Số lượng sản phẩm
    MIN_QUANTITY("Số lượng sản phẩm tối thiểu"),
    MAX_QUANTITY("Số lượng sản phẩm tối đa");

    private final String description;

    EventRuleType(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}