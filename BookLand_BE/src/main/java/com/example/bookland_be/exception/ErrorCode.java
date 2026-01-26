package com.example.bookland_be.exception;

import org.springframework.http.HttpStatus;

public enum ErrorCode {
    UNCATEGORIZED_EXCEPTION(9999, "Uncategorized error", HttpStatus.INTERNAL_SERVER_ERROR),
    INVALID_KEY(1001, "Uncategorized error", HttpStatus.BAD_REQUEST),
    USERNAME_INVALID(1003, "Username must be at least {min} characters", HttpStatus.BAD_REQUEST),
    INVALID_PASSWORD(1004, "Password must be at least {min} characters", HttpStatus.BAD_REQUEST),
    USER_NOT_EXISTED(1005, "User not existed", HttpStatus.NOT_FOUND),
    UNAUTHENTICATED(1006, "Unauthenticated", HttpStatus.UNAUTHORIZED),
    UNAUTHORIZED(1007, "You do not have permission", HttpStatus.FORBIDDEN),
    INVALID_DOB(1008, "Your age must be at least {min}", HttpStatus.BAD_REQUEST),
    EMAIL_EXISTED(1009, "Email existed, please choose another one", HttpStatus.BAD_REQUEST),
    USER_EXISTED(1010, "Username existed, please choose another one", HttpStatus.BAD_REQUEST),
    USERNAME_IS_MISSING(1011, "Please enter username", HttpStatus.BAD_REQUEST),
    
    // Book errors
    BOOK_NOT_FOUND(2001, "Book not found", HttpStatus.NOT_FOUND),
    BOOK_OUT_OF_STOCK(2002, "Book is out of stock or insufficient quantity", HttpStatus.BAD_REQUEST),
    BOOK_HAS_ORDERS(2003, "Cannot delete book with existing orders", HttpStatus.BAD_REQUEST),
    
    // Author errors
    AUTHOR_NOT_FOUND(2101, "Author not found", HttpStatus.NOT_FOUND),
    AUTHOR_NAME_EXISTED(2102, "Author name already exists", HttpStatus.BAD_REQUEST),
    AUTHOR_HAS_BOOKS(2103, "Cannot delete author with existing books", HttpStatus.BAD_REQUEST),
    
    // Publisher errors
    PUBLISHER_NOT_FOUND(2201, "Publisher not found", HttpStatus.NOT_FOUND),
    PUBLISHER_NAME_EXISTED(2202, "Publisher name already exists", HttpStatus.BAD_REQUEST),
    PUBLISHER_HAS_BOOKS(2203, "Cannot delete publisher with existing books", HttpStatus.BAD_REQUEST),
    
    // Serie errors
    SERIE_NOT_FOUND(2301, "Serie not found", HttpStatus.NOT_FOUND),
    SERIE_NAME_EXISTED(2302, "Serie name already exists", HttpStatus.BAD_REQUEST),
    SERIE_HAS_BOOKS(2303, "Cannot delete serie with existing books", HttpStatus.BAD_REQUEST),
    
    // Category errors
    CATEGORY_NOT_FOUND(2401, "Category not found", HttpStatus.NOT_FOUND),
    
    // Supplier errors
    SUPPLIER_NOT_FOUND(2501, "Supplier not found", HttpStatus.NOT_FOUND),
    SUPPLIER_NAME_EXISTED(2502, "Supplier name already exists", HttpStatus.BAD_REQUEST),
    
    // Shipping Method errors
    SHIPPING_METHOD_NOT_FOUND(2601, "Shipping method not found", HttpStatus.NOT_FOUND),
    
    // Cart errors
    CART_NOT_FOUND(2701, "Cart not found", HttpStatus.NOT_FOUND),
    CART_ITEM_NOT_FOUND(2702, "Cart item not found", HttpStatus.NOT_FOUND),
    
    // Wishlist errors
    WISHLIST_NOT_FOUND(2801, "Wishlist not found", HttpStatus.NOT_FOUND),
    WISHLIST_ITEM_NOT_FOUND(2802, "Wishlist item not found", HttpStatus.NOT_FOUND),
    
    // Event errors
    EVENT_NOT_FOUND(2901, "Event not found", HttpStatus.NOT_FOUND),
    
    // Bill errors
    BILL_NOT_FOUND(3001, "Bill not found", HttpStatus.NOT_FOUND),
    
    // Payment Method errors (2651-2660)
    PAYMENT_METHOD_NOT_FOUND(2651, "Payment method not found", HttpStatus.NOT_FOUND),
    
    // Role errors
    ROLE_NOT_FOUND(3101, "Role not found", HttpStatus.NOT_FOUND),
    SOME_ROLES_NOT_FOUND(3102, "Some roles not found", HttpStatus.NOT_FOUND),
    ;


    ErrorCode(int errorCode, String message, HttpStatus httpStatus){
        this.errorCode = errorCode;
        this.message = message;
        this.httpStatus = httpStatus;
    }

    private HttpStatus httpStatus;
    private int errorCode;
    private String message;

    public int getErrorCode(){
        return errorCode;
    }
    public String getMessage(){
        return message;
    }
    public HttpStatus getHttpStatus(){
        return httpStatus;
    }
}
