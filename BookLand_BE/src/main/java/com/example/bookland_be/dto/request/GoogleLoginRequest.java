package com.example.bookland_be.dto.request;

import lombok.Data;

@Data
public class GoogleLoginRequest {
    private String idToken; // id_token trả về từ Google Sign-In ở Frontend
}
