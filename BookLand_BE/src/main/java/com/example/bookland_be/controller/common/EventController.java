package com.example.bookland_be.controller.common;

import com.example.bookland_be.dto.EventDTO;
import com.example.bookland_be.dto.request.EventRequest;
import com.example.bookland_be.dto.response.ApiResponse;
import com.example.bookland_be.entity.Event.EventStatus;
import com.example.bookland_be.enums.EventActionType;
import com.example.bookland_be.enums.EventRuleType;
import com.example.bookland_be.enums.EventTargetType;
import com.example.bookland_be.enums.EventType;
import com.example.bookland_be.service.EventService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

// Theo MIN_ORDER_VALUE (full cac trg)
//{
//"name": "Flash Sale Cuối Tuần",
//"description": "Giảm giá sốc 50%",
//"type": "FLASH_SALE",
//"startTime": "2024-12-01T00:00:00",
//"endTime": "2024-12-03T23:59:59",
//"status": "ACTIVE",
//"priority": 10,
//"createdById": 1,
//"mainImageUrls": ["https://example.com/main.jpg"],
//"subImageUrls": ["https://example.com/sub1.jpg", "https://example.com/sub2.jpg"],
//"targets": [{"targetType": "CATEGORY", "targetId": 1}],
//"rules": [{"ruleType": "MIN_ORDER_VALUE", "ruleValue": "100000"}],
//"actions": [{"actionType": "DISCOUNT_PERCENT", "actionValue": "50"}]
//}


// Theo Serie:
//{
//"name": "Giảm giá theo Serie Harry Potter",
//"description": "Giảm giá theo Serie Harry Potter sốc 50%",
//"type": "FLASH_SALE",
//"startTime": "2024-12-01T00:00:00",
//"endTime": "2024-12-09T23:59:59",
//"status": "ACTIVE",
//"priority": 1,
//"createdById": 1,
//"mainImageUrls": ["https://example.com/main.jpg"],
//"subImageUrls": ["https://example.com/sub1.jpg", "https://example.com/sub2.jpg"],
//"targets": [{"targetType": "SERIES", "targetId": 1}],
//"actions": [{"actionType": "DISCOUNT_PERCENT", "actionValue": "50"}]
//}
@RestController
@RequestMapping("/api/events")
@RequiredArgsConstructor
@SecurityRequirement(name = "BearerAuth")
public class EventController {

    private final EventService eventService;

    @GetMapping
    public ApiResponse<Page<EventDTO>> getAllEvents(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) EventStatus status,
            @RequestParam(required = false) EventType type,
            @RequestParam(required = false) EventTargetType targetType,
            @RequestParam(required = false) EventActionType actionType,
            @RequestParam(required = false) EventRuleType ruleType,
            @RequestParam(required = false) Long createdById,
            @RequestParam(required = false) Integer minPriority,
            @RequestParam(required = false) Boolean activeOnly,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime toDate,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "priority") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDirection
    ) {
        Sort.Direction direction = sortDirection.equalsIgnoreCase("ASC")
                ? Sort.Direction.ASC
                : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));

        Page<EventDTO> events = eventService.getAllEvents(keyword, status, type,
                targetType, actionType, ruleType, createdById, minPriority,
                activeOnly, fromDate, toDate, pageable);
        return ApiResponse.<Page<EventDTO>>builder().result(events).build();
    }

    @GetMapping("/{id}")
    public ApiResponse<EventDTO> getEventById(@PathVariable Long id) {
        return ApiResponse.<EventDTO>builder().result(eventService.getEventById(id)).build();
    }

    @PostMapping
    public ApiResponse<EventDTO> createEvent(@Valid @RequestBody EventRequest request) {
        return ApiResponse.<EventDTO>builder().result(eventService.createEvent(request)).build();
    }

    @PutMapping("/{id}")
    public ApiResponse<EventDTO> updateEvent(
            @PathVariable Long id,
            @Valid @RequestBody EventRequest request) {
        return ApiResponse.<EventDTO>builder().result(eventService.updateEvent(id, request)).build();
    }

    @PatchMapping("/{id}/status")
    public ApiResponse<EventDTO> updateEventStatus(
            @PathVariable Long id,
            @RequestParam EventStatus status) {
        return ApiResponse.<EventDTO>builder().result(eventService.updateEventStatus(id, status)).build();
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteEvent(@PathVariable Long id) {
        eventService.deleteEvent(id);
        return ApiResponse.<Void>builder().build();
    }
}