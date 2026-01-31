package com.example.bookland_be.service;

import com.example.bookland_be.dto.*;
import com.example.bookland_be.dto.request.BillBookRequest;
import com.example.bookland_be.dto.request.PreviewBillRequest;
import com.example.bookland_be.entity.*;
import com.example.bookland_be.exception.AppException;
import com.example.bookland_be.exception.ErrorCode;
import com.example.bookland_be.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
@RequiredArgsConstructor
public class BillPreviewService {

    private final BookRepository bookRepository;
    private final ShippingMethodRepository shippingMethodRepository;
    private final EventApplicationService eventApplicationService;

    /**
     * Preview bill trước khi tạo - xem có event nào áp dụng không
     */
    @Transactional(readOnly = true)
    public BillPreviewDTO previewBill(PreviewBillRequest request) {
        ShippingMethod shippingMethod = shippingMethodRepository.findById(request.getShippingMethodId())
                .orElseThrow(() -> new AppException(ErrorCode.SHIPPING_METHOD_NOT_FOUND));

        // 1. Tính toán trước tổng tiền và số lượng
        double tempTotalCost = 0.0;
        int totalQuantity = 0;
        List<BillBookRequest> bookRequests = request.getBooks();
        Map<Long, Book> bookMap = new HashMap<>();

        for (BillBookRequest br : bookRequests) {
            Book book = bookRepository.findById(br.getBookId())
                    .orElseThrow(() -> new AppException(ErrorCode.BOOK_NOT_FOUND));
            
            if (book.getStock() < br.getQuantity()) {
                throw new AppException(ErrorCode.BOOK_OUT_OF_STOCK);
            }
            
            tempTotalCost += book.getFinalPrice() * br.getQuantity();
            totalQuantity += br.getQuantity();
            bookMap.put(book.getId(), book);
        }

        // 2. Lấy Event và Check Rule
        Optional<Event> activeEventOpt = eventApplicationService.getHighestPriorityActiveEvent();
        Event appliedEvent = null;
        
        if (activeEventOpt.isPresent()) {
            Event event = activeEventOpt.get();
            // User = null vì preview chưa có user context đầy đủ hoặc có thể truyền nếu cần
            boolean isEligible = eventApplicationService.checkEventRule(event, null, tempTotalCost, totalQuantity);
            if (isEligible) {
                appliedEvent = event;
            }
        }


        // 3. Build kết quả
        List<BookPreviewDTO> bookPreviews = new ArrayList<>();
        double originalTotal = 0.0;
        double discountedTotal = 0.0;

        for (BillBookRequest br : bookRequests) {
            Book book = bookMap.get(br.getBookId());
            Double originalPrice = book.getFinalPrice();
            Double finalPrice = originalPrice;
            boolean hasDiscount = false;

            if (appliedEvent != null && eventApplicationService.isBookInEventTarget(appliedEvent, book)) {
                finalPrice = eventApplicationService.calculateDiscountedPrice(appliedEvent, originalPrice);
                hasDiscount = true;
            }

            BookPreviewDTO bookPreview = BookPreviewDTO.builder()
                    .bookId(book.getId())
                    .bookName(book.getName())
                    .bookImageUrl(book.getBookImageUrl())
                    .originalPrice(originalPrice)
                    .eventDiscountedPrice(hasDiscount ? finalPrice : null)
                    .finalPrice(finalPrice)
                    .quantity(br.getQuantity())
                    .subtotal(finalPrice * br.getQuantity())
                    .hasEventDiscount(hasDiscount)
                    .build();

            bookPreviews.add(bookPreview);
            originalTotal += originalPrice * br.getQuantity();
            discountedTotal += finalPrice * br.getQuantity();
        }

        double shippingCost = shippingMethod.getPrice();
        double grandTotal = discountedTotal + shippingCost;
        double totalSaved = originalTotal - discountedTotal;

        return BillPreviewDTO.builder()
                .books(bookPreviews)
                .originalSubtotal(originalTotal)
                .discountedSubtotal(discountedTotal)
                .shippingCost(shippingCost)
                .totalSaved(totalSaved)
                .grandTotal(grandTotal)
                .appliedEventId(appliedEvent != null ? appliedEvent.getId() : null)
                .appliedEventName(appliedEvent != null ? appliedEvent.getName() : null)
                .appliedEventType(appliedEvent != null ? appliedEvent.getType() : null)
                .hasEventApplied(appliedEvent != null)
                .build();
    }
}
