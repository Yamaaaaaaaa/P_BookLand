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
                case EXACT_QUANTITY:
                    return totalQuantity == Integer.parseInt(value);

                // --- Số lượng items trong giỏ (Tạm tính bằng totalQuantity nếu không có data cart) ---
                case MIN_ITEMS_IN_CART:
                    return totalQuantity >= Integer.parseInt(value);

                // --- Giới hạn sử dụng (Cần repository check log - Tạm thời bỏ qua hoặc return true) ---
                case MAX_USAGE_PER_USER:
                case MAX_USAGE_TOTAL:
                case MAX_USAGE_PER_DAY:
                    // TODO: Implement actual check using EventLogRepository
                    return true;

                // --- Thời gian ---
                case TIME_RANGE:
                    // value format: "HH:mm-HH:mm" e.g. "09:00-21:00"
                    String[] parts = value.split("-");
                    if (parts.length == 2) {
                        LocalTime start = LocalTime.parse(parts[0]);
                        LocalTime end = LocalTime.parse(parts[1]);
                        LocalTime now = LocalTime.now();
                        return !now.isBefore(start) && !now.isAfter(end);
                    }
                    return false;
                case DAY_OF_WEEK:
                    // value: MON,TUE...
                    String today = LocalDate.now().getDayOfWeek().name().substring(0, 3);
                    return value.contains(today);

                // --- User conditions ---
                case NEW_USER_ONLY:
                    // Giả sử logic check new user (ví dụ đăng ký trong vòng 7 ngày)
                    boolean isNew = user.getCreatedAt().isAfter(LocalDateTime.now().minusDays(7));
                    return Boolean.parseBoolean(value) == isNew;
                    
                case USER_REGISTERED_BEFORE:
                    LocalDate regBefore = LocalDate.parse(value);
                    return user.getCreatedAt().toLocalDate().isBefore(regBefore);
                
                case USER_REGISTERED_AFTER:
                     LocalDate regAfter = LocalDate.parse(value);
                     return user.getCreatedAt().toLocalDate().isAfter(regAfter);

                // --- Purchase history (Cần BillRepo - Tạm return true) ---
                case FIRST_PURCHASE:
                case PURCHASED_BEFORE:
                case TOTAL_SPENT_MIN:
                    return true;

                 // --- Payment & Location & Other ---
                default:
                    // Các rule khác tạm thời trả về true nếu chưa có context xử lý
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
        try {
            if (action.getActionType() == EventActionType.DISCOUNT_PERCENT) {
                Double percent = Double.parseDouble(action.getActionValue());
                if (percent < 0 || percent > 100) return originalPrice;
                return originalPrice * (1 - percent / 100);
            } else if (action.getActionType() == EventActionType.DISCOUNT_AMOUNT) {
                Double amount = Double.parseDouble(action.getActionValue());
                Double result = originalPrice - amount;
                return result > 0 ? result : 0.0;
            } else if (action.getActionType() == EventActionType.DISCOUNT_FIXED_PRICE) {
                 Double fixed = Double.parseDouble(action.getActionValue());
                 return fixed < originalPrice ? fixed : originalPrice;
            }
            return originalPrice;
        } catch (NumberFormatException e) {
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