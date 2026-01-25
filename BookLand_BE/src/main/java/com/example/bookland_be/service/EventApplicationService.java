// EventApplicationService.java
package com.example.bookland_be.service;

import com.example.bookland_be.entity.*;
import com.example.bookland_be.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EventApplicationService {

    private final EventRepository eventRepository;
    private final EventLogRepository eventLogRepository;
    private final BookRepository bookRepository;

    /**
     * Lấy Event có priority cao nhất đang active
     */
    @Transactional(readOnly = true)
    public Optional<Event> getHighestPriorityActiveEvent() {
        LocalDateTime now = LocalDateTime.now();
        System.out.println("[EVENT] now = " + now);

        return eventRepository
                .findAll(PageRequest.of(0, 1, Sort.by(Sort.Direction.DESC, "priority")))
                .stream()
                .peek(event -> System.out.println(
                        "[EVENT] Found (before filter) " +
                                "id=" + event.getId() +
                                ", name=" + event.getName() +
                                ", priority=" + event.getPriority() +
                                ", status=" + event.getStatus() +
                                ", start=" + event.getStartTime() +
                                ", end=" + event.getEndTime()
                ))
                .filter(event -> {
                    boolean active = event.getStatus() == Event.EventStatus.ACTIVE;
                    System.out.println(
                            "[EVENT] Status check for eventId=" + event.getId() +
                                    " => " + active
                    );
                    return active;
                })
                .filter(event -> {
                    boolean inTime =
                            now.isAfter(event.getStartTime()) &&
                                    now.isBefore(event.getEndTime());
                    System.out.println(
                            "[EVENT] Time check for eventId=" + event.getId() +
                                    " => " + inTime
                    );
                    return inTime;
                })
                .findFirst();
    }

    /**
     * Kiểm tra xem Book có nằm trong target của Event không
     */
    public boolean isBookInEventTarget(Event event, Book book) {
        if (event.getTargets().isEmpty()) {
            return false;
        }

        for (EventTarget target : event.getTargets()) {
            switch (target.getTargetType()) {
                case BOOK:
                    // Áp dụng cho sách cụ thể
                    if (book.getId().equals(target.getTargetId())) {
                        return true;
                    }
                    break;

                case CATEGORY:
                    // Áp dụng cho toàn bộ sách trong danh mục
                    boolean hasCategory = book.getCategories().stream()
                            .anyMatch(cat -> cat.getId().equals(target.getTargetId()));
                    if (hasCategory) {
                        return true;
                    }
                    break;

                case SERIES:
                    // Áp dụng cho toàn bộ sách trong bộ sách
                    if (book.getSeries() != null && book.getSeries().getId().equals(target.getTargetId())) {
                        return true;
                    }
                    break;

                case AUTHOR:
                    // Áp dụng cho toàn bộ sách của tác giả
                    if (book.getAuthor().getId().equals(target.getTargetId())) {
                        return true;
                    }
                    break;

                case PUBLISHER:
                    // Áp dụng cho toàn bộ sách của nhà xuất bản
                    if (book.getPublisher().getId().equals(target.getTargetId())) {
                        return true;
                    }
                    break;

                case ALL:
                    // Áp dụng cho tất cả
                    return true;

                default:
                    break;
            }
        }

        return false;
    }

    /**
     * Tính giá sau khi áp dụng Event
     */
    public Double calculateDiscountedPrice(Event event, Double originalPrice) {
        if (event.getActions().isEmpty()) {
            return originalPrice;
        }

        // Lấy action đầu tiên (có thể mở rộng để apply nhiều actions)
        EventAction action = event.getActions().iterator().next();

        return applyAction(action, originalPrice);
    }

    /**
     * Áp dụng action lên giá
     */
    private Double applyAction(EventAction action, Double originalPrice) {
        try {
            switch (action.getActionType()) {
                case DISCOUNT_PERCENT:
                    // Giảm theo %
                    Double percent = Double.parseDouble(action.getActionValue());
                    if (percent < 0 || percent > 100) {
                        return originalPrice;
                    }
                    return originalPrice * (1 - percent / 100);

                case DISCOUNT_AMOUNT:
                    // Giảm theo số tiền cố định
                    Double discountAmount = Double.parseDouble(action.getActionValue());
                    Double afterDiscount = originalPrice - discountAmount;
                    return afterDiscount > 0 ? afterDiscount : 0.0;

                case DISCOUNT_FIXED_PRICE:
                    // Giá cố định
                    Double fixedPrice = Double.parseDouble(action.getActionValue());
                    return fixedPrice < originalPrice ? fixedPrice : originalPrice;

                default:
                    return originalPrice;
            }
        } catch (NumberFormatException e) {
            // Nếu parse lỗi thì giữ nguyên giá gốc
            return originalPrice;
        }
    }

    /**
     * Lưu log khi áp dụng event vào bill
     */
    @Transactional
    public void logEventApplication(Event event, User user, Bill bill, Integer discountValue) {
        EventLog log = EventLog.builder()
                .event(event)
                .user(user)
                .bill(bill)
                .appliedValue(discountValue)
                .build();

        eventLogRepository.save(log);
    }
}