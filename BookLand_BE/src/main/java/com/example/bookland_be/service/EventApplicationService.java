// EventApplicationService.java
package com.example.bookland_be.service;

import com.example.bookland_be.entity.*;
import com.example.bookland_be.enums.EventActionType;
import com.example.bookland_be.enums.EventRuleType;
import com.example.bookland_be.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeParseException;
import java.util.*;

@Service
@RequiredArgsConstructor
public class EventApplicationService {

    private final EventRepository eventRepository;
    private final EventLogRepository eventLogRepository;
    private final BookRepository bookRepository;
    // Assume we might need these repositories for complex checks
    // private final BillRepository billRepository; 
    // private final UserRepository userRepository;

    /**
     * Lấy Event có priority cao nhất đang active
     */
    @Transactional(readOnly = true)
    public Optional<Event> getHighestPriorityActiveEvent() {
        LocalDateTime now = LocalDateTime.now();

        return eventRepository
                .findAll(PageRequest.of(0, 1, Sort.by(Sort.Direction.DESC, "priority")))
                .stream()
                .filter(event -> event.getStatus() == Event.EventStatus.ACTIVE)
                .filter(event -> now.isAfter(event.getStartTime()) && now.isBefore(event.getEndTime()))
                .findFirst();
    }

    /**
     * Kiểm tra xem Book có nằm trong target của Event không
     */
    public boolean isBookInEventTarget(Event event, Book book) {
        if (event.getTargets() == null || event.getTargets().isEmpty()) {
            return false;
        }

        for (EventTarget target : event.getTargets()) {
            switch (target.getTargetType()) {
                case BOOK:
                    if (book.getId().equals(target.getTargetId())) return true;
                    break;
                case CATEGORY:
                    if (book.getCategories().stream().anyMatch(cat -> cat.getId().equals(target.getTargetId()))) return true;
                    break;
                case SERIES:
                    if (book.getSeries() != null && book.getSeries().getId().equals(target.getTargetId())) return true;
                    break;
                case AUTHOR:
                    if (book.getAuthor().getId().equals(target.getTargetId())) return true;
                    break;
                case PUBLISHER:
                    if (book.getPublisher().getId().equals(target.getTargetId())) return true;
                    break;
                case ALL:
                    return true;
                default:
                    break;
            }
        }
        return false;
    }

    /**
     * Kiểm tra Rule đầu tiên của Event
     * Trả về true nếu thỏa mãn, false nếu không
     */
    public boolean checkEventRule(Event event, User user, Double orderValue, Integer totalQuantity) {
        if (event.getRules() == null || event.getRules().isEmpty()) {
            return true; // Không có rule thì coi như thỏa mãn
        }

        // CHỈ KIỂM TRA RULE ĐẦU TIÊN
        EventRule rule = event.getRules().iterator().next();
        String value = rule.getRuleValue();

        try {
            switch (rule.getRuleType()) {
                // --- Giá trị đơn hàng ---
                case MIN_ORDER_VALUE:
                    return orderValue >= Double.parseDouble(value);
                case MAX_ORDER_VALUE:
                    return orderValue <= Double.parseDouble(value);

                // --- Số lượng sản phẩm ---
                case MIN_QUANTITY:
                    return totalQuantity >= Integer.parseInt(value);
                case MAX_QUANTITY:
                    return totalQuantity <= Integer.parseInt(value);

                default:
                    // Các rule khác tạm thời trả về true
                    return true;
            }
        } catch (Exception e) {
            // Log error parsing rule
            e.printStackTrace();
            return false; // Safest fallback
        }
    }


    /**
     * Tính giá sau khi áp dụng Event
     */
    public Double calculateDiscountedPrice(Event event, Double originalPrice) {
        if (event.getActions() == null || event.getActions().isEmpty()) {
            return originalPrice;
        }

        EventAction action = event.getActions().iterator().next();
        return applyAction(action, originalPrice);
    }

    private Double applyAction(EventAction action, Double originalPrice) {
        String rawValue = action.getActionValue();

        // Validate: giá trị không được null/rỗng và phải là số hợp lệ (chỉ chứa chữ số và dấu chấm)
        if (rawValue == null || rawValue.isBlank()) {
            System.err.println("[EventAction] actionValue is null or blank, skipping discount.");
            return originalPrice;
        }
        if (!rawValue.matches("^\\d+(\\.\\d+)?$")) {
            System.err.println("[EventAction] actionValue '" + rawValue + "' is not a valid number, skipping discount.");
            return originalPrice;
        }

        double value = Double.parseDouble(rawValue);

        if (action.getActionType() == EventActionType.DISCOUNT_PERCENT) {
            // DISCOUNT_PERCENT: phải trong khoảng (0, 100]
            if (value <= 0 || value > 100) {
                System.err.println("[EventAction] DISCOUNT_PERCENT value=" + value + " out of range (0, 100], skipping.");
                return originalPrice;
            }
            return originalPrice * (1 - value / 100);

        } else if (action.getActionType() == EventActionType.DISCOUNT_AMOUNT) {
            // DISCOUNT_AMOUNT: phải > 0
            if (value <= 0) {
                System.err.println("[EventAction] DISCOUNT_AMOUNT value=" + value + " must be > 0, skipping.");
                return originalPrice;
            }
            double result = originalPrice - value;
            return result > 0 ? result : 0.0;
        }

        return originalPrice;
    }

    public boolean hasFreeShipping(Event event) {
        if (event.getActions() == null || event.getActions().isEmpty()) {
            return false;
        }
        return event.getActions().stream()
                .anyMatch(action -> action.getActionType() == EventActionType.FREE_SHIPPING);
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