package com.example.bookland_be.controller;

import com.example.bookland_be.dto.response.ApiResponse;
import com.example.bookland_be.dto.response.NotificationResponse;
import com.example.bookland_be.service.NotificationService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/notifications")
@RequiredArgsConstructor
@SecurityRequirement(name = "BearerAuth")
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping("/user/{userId}")
    public ApiResponse<Page<NotificationResponse>> getNotifications(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return ApiResponse.<Page<NotificationResponse>>builder()
                .result(notificationService.getNotifications(userId, pageable))
                .build();
    }

    @GetMapping("/user/{userId}/unread-count")
    public ApiResponse<Long> getUnreadCount(@PathVariable Long userId) {
        return ApiResponse.<Long>builder()
                .result(notificationService.countUnread(userId))
                .build();
    }

    @PutMapping("/{id}/read")
    public ApiResponse<Void> markAsRead(@PathVariable Long id) {
        notificationService.markAsRead(id);
        return ApiResponse.<Void>builder().message("Marked as read").build();
    }

    @PutMapping("/user/{userId}/read-all")
    public ApiResponse<Void> markAllAsRead(@PathVariable Long userId) {
        notificationService.markAllAsRead(userId);
        return ApiResponse.<Void>builder().message("All marked as read").build();
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteNotification(@PathVariable Long id) {
        notificationService.deleteNotification(id);
        return ApiResponse.<Void>builder().message("Notification deleted").build();
    }

    @DeleteMapping("/user/{userId}/read")
    public ApiResponse<Void> deleteAllReadNotifications(@PathVariable Long userId) {
        notificationService.deleteAllRead(userId);
        return ApiResponse.<Void>builder().message("All read notifications deleted").build();
    }
}
