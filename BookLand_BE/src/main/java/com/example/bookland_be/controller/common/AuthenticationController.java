package com.example.bookland_be.controller.common;

import com.example.bookland_be.dto.request.*;
import com.example.bookland_be.dto.response.ApiResponse;
import com.example.bookland_be.dto.response.AuthenticationResponse;
import com.example.bookland_be.dto.response.IntrospectResponse;
import com.example.bookland_be.dto.response.LoginResponse;
import com.example.bookland_be.dto.response.UserResponse;
import com.example.bookland_be.service.AuthenticationService;
import com.example.bookland_be.service.EmailService;
import com.nimbusds.jose.JOSEException;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.*;

import java.text.ParseException;
import java.util.Map;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@SecurityRequirement(name = "BearerAuth")
public class AuthenticationController {
    AuthenticationService authenticationService;
    EmailService emailService;

    // API Lấy Token mới bằng RefreshToken
    @PostMapping("/refresh")
    public ApiResponse<AuthenticationResponse> getNewAccessTokenByRefreshToken(@RequestBody RefreshRequest refreshRequest) throws ParseException, JOSEException {
        var result = authenticationService.getTokenByRefresh(refreshRequest);
        return ApiResponse.<AuthenticationResponse>builder().result(result).build();
    }

    @PostMapping("/login")
    public ApiResponse<LoginResponse> login(@RequestBody LoginRequest request) throws JOSEException, ParseException {
        var result = authenticationService.login(request);
        return ApiResponse.<LoginResponse>builder().result(result).build();
    }

    @PostMapping("/admin/login")
    public ApiResponse<LoginResponse> adminlogin(@RequestBody LoginRequest request) throws JOSEException, ParseException {
        var result = authenticationService.adminlogin(request);
        return ApiResponse.<LoginResponse>builder().result(result).build();
    }

    @PostMapping("/register")
    public ApiResponse<UserResponse> register(@RequestBody RegisterRequest request) throws JOSEException, ParseException {
        var result = authenticationService.register(request);
        return ApiResponse.<UserResponse>builder().result(result).build();
    }

    @PostMapping("/logout")
    public ApiResponse<Void> logout(@RequestBody LogoutRequest logoutRequest) throws JOSEException, ParseException{
        authenticationService.logout(logoutRequest);
        return ApiResponse.<Void>builder().build();
    }

    // Forgot Password: Chờ ng dùng phải tạo nguyên một cái giao diện để đổi MK cơ

    // Dev: API kiểm tra token hợp lệ
    @PostMapping("/introspect")
    public ApiResponse<IntrospectResponse> introspect(@RequestBody IntrospectRequest request) throws JOSEException, ParseException {
        var result = authenticationService.introspect(request);
        return ApiResponse.<IntrospectResponse>builder().result(result).build();
    }

    // Dev: API lấy RefreshToken
    @PostMapping("/test-refresh")
    public ApiResponse<AuthenticationResponse> refresh(@RequestBody RefreshRequest refreshRequest)  throws JOSEException, ParseException{
        var result = authenticationService.refreshToken(refreshRequest);
        return ApiResponse.<AuthenticationResponse>builder().result(result).build();
    }

    // Đăng nhập bằng Google (FE gửi id_token từ Google Sign-In)
    @PostMapping("/google")
    public ApiResponse<LoginResponse> loginWithGoogle(@RequestBody GoogleLoginRequest request) {
        var result = authenticationService.loginWithGoogle(request);
        return ApiResponse.<LoginResponse>builder().result(result).build();
    }

    // API Test Gửi Mail
    @PostMapping("/test-email")
    public ApiResponse<String> testEmail(@RequestParam String to) {
        Map<String, Object> model = Map.of(
            "name", "Khách Hàng Test",
            "message", "Đây là một email thử nghiệm hệ thống BookLand. Nếu bạn nhận được email này, tính năng SMTP đang hoạt động rất tốt!",
            "details", "Test connection với Google SMTP qua cổng 587.",
            "actionUrl", "http://localhost:5173",
            "actionText", "Truy cập BookLand"
        );
        emailService.sendEmailWithHtmlTemplate(to, "Test Email từ BookLand", "email-template", model);
        
        return ApiResponse.<String>builder()
                .result("Đang gửi mail đến " + to + ". Hãy kiểm tra hộp thư của bạn!")
                .build();
    }
}
