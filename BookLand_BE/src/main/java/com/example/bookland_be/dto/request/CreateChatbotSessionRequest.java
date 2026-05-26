package com.example.bookland_be.dto.request;

import lombok.*;

/**
 * Request tạo chatbot session mới.
 * - guest_token: UUID do frontend tạo, lưu trong localStorage.
 *   Null nếu user đã đăng nhập (lúc đó dùng JWT).
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateChatbotSessionRequest {
    private String guestToken; // Optional, null nếu đã đăng nhập
}
