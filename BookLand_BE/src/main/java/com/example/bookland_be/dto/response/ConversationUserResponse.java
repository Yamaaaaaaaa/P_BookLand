package com.example.bookland_be.dto.response;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ConversationUserResponse {
    private Long userId;
    private String username;
    private String email;
    private Long unreadCount;
    private ChatMessageResponse lastMessage;
}
