package com.example.bookland_be.enums;

public enum EventActionType {
    // Giảm giá theo %
    DISCOUNT_PERCENT("Giảm theo % (value: 0-100)"),

    // Giảm giá cố định
    DISCOUNT_AMOUNT("Giảm theo số tiền (VNĐ)"),

    // Miễn phí vận chuyển
    FREE_SHIPPING("Miễn phí ship"),

    // Giảm trên tổng hóa đơn (nhóm)
    BILL_DISCOUNT_PERCENT("Giảm % trên tổng hóa đơn nhóm"),
    BILL_DISCOUNT_AMOUNT("Giảm tiền trên tổng hóa đơn nhóm");

    private final String description;

    EventActionType(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}