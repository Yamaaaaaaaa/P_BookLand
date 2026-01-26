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

        // Lấy event có priority cao nhất
        Optional<Event> activeEventOpt = eventApplicationService.getHighestPriorityActiveEvent();


        List<BookPreviewDTO> bookPreviews = new ArrayList<>();
        double originalTotal = 0.0;
        double discountedTotal = 0.0;
        Event appliedEvent = null;

        for (BillBookRequest bookRequest : request.getBooks()) {
            Book book = bookRepository.findById(bookRequest.getBookId())
                    .orElseThrow(() -> new AppException(ErrorCode.BOOK_NOT_FOUND));

            if (book.getStock() < bookRequest.getQuantity()) {
                throw new AppException(ErrorCode.BOOK_OUT_OF_STOCK);
            }

            Double originalPrice = book.getFinalPrice();
            Double finalPrice = originalPrice;
            boolean hasDiscount = false;

            // Kiểm tra và áp dụng event
            if (activeEventOpt.isPresent()) {
                Event event = activeEventOpt.get();
                if (eventApplicationService.isBookInEventTarget(event, book)) {
                    finalPrice = eventApplicationService.calculateDiscountedPrice(event, originalPrice);
                    hasDiscount = true;
                    appliedEvent = event;
                }
            }

            BookPreviewDTO bookPreview = BookPreviewDTO.builder()
                    .bookId(book.getId())
                    .bookName(book.getName())
                    .bookImageUrl(book.getBookImageUrl())
                    .originalPrice(originalPrice)
                    .eventDiscountedPrice(hasDiscount ? finalPrice : null)
                    .finalPrice(finalPrice)
                    .quantity(bookRequest.getQuantity())
                    .subtotal(finalPrice * bookRequest.getQuantity())
                    .hasEventDiscount(hasDiscount)
                    .build();

            bookPreviews.add(bookPreview);

            originalTotal += originalPrice * bookRequest.getQuantity();
            discountedTotal += finalPrice * bookRequest.getQuantity();
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
