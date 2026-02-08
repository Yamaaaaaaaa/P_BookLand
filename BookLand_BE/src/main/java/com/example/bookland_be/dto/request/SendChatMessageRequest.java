package com.example.bookland_be.dto.request;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SendChatMessageRequest {
    private String toEmail;
    private String content;
}
