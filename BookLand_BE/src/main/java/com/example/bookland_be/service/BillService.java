// BillService.java (Updated with Simplified Event Rules Check)
package com.example.bookland_be.service;

import com.example.bookland_be.dto.*;
import com.example.bookland_be.dto.request.BillBookRequest;
import com.example.bookland_be.dto.request.CreateBillRequest;
import com.example.bookland_be.dto.request.UpdateBillStatusRequest;
import com.example.bookland_be.entity.*;
import com.example.bookland_be.entity.Bill.BillStatus;
import com.example.bookland_be.exception.AppException;
import com.example.bookland_be.exception.ErrorCode;
import com.example.bookland_be.repository.*;
import com.example.bookland_be.repository.specification.BillSpecification;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BillService {

    private final BillRepository billRepository;
    private final BillBookRepository billBookRepository;
    private final UserRepository userRepository;
    private final BookRepository bookRepository;
    private final PaymentMethodRepository paymentMethodRepository;
    private final ShippingMethodRepository shippingMethodRepository;
    private final EventApplicationService eventApplicationService;

    @Transactional(readOnly = true)
    public Page<BillDTO> getAllBills(Long userId, BillStatus status,
                                     LocalDateTime fromDate, LocalDateTime toDate,
                                     Double minCost, Double maxCost,
                                     Pageable pageable) {
        Specification<Bill> spec = Specification.unrestricted();

        if (userId != null) {
            spec = spec.and(BillSpecification.hasUser(userId));
        }

        if (status != null) {
            spec = spec.and(BillSpecification.hasStatus(status));
        }

        if (fromDate != null || toDate != null) {
            spec = spec.and(BillSpecification.createdBetween(fromDate, toDate));
        }

        if (minCost != null || maxCost != null) {
            spec = spec.and(BillSpecification.totalCostBetween(minCost, maxCost));
        }

        return billRepository.findAll(spec, pageable)
                .map(this::convertToDTO);
    }

    @Transactional(readOnly = true)
    public BillDTO getBillById(Long id) {
        Bill bill = billRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.BILL_NOT_FOUND));
        return convertToDTO(bill);
    }

    @Transactional
    public BillDTO createBill(CreateBillRequest request) {
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        PaymentMethod paymentMethod = paymentMethodRepository.findById(request.getPaymentMethodId())
                .orElseThrow(() -> new AppException(ErrorCode.PAYMENT_METHOD_NOT_FOUND));

        ShippingMethod shippingMethod = shippingMethodRepository.findById(request.getShippingMethodId())
                .orElseThrow(() -> new AppException(ErrorCode.SHIPPING_METHOD_NOT_FOUND));

        // 1. Tính toán giá trị đơn hàng tạm thời (chưa giảm giá) để check rule
        double tempTotalCost = 0.0;
        int totalQuantity = 0;
        List<Book> books = new ArrayList<>();
        Map<Long, Integer> quantities = new HashMap<>();

        for (BillBookRequest bookRequest : request.getBooks()) {
            Book book = bookRepository.findById(bookRequest.getBookId())
                    .orElseThrow(() -> new AppException(ErrorCode.BOOK_NOT_FOUND));
            
            if (book.getStock() < bookRequest.getQuantity()) {
                throw new AppException(ErrorCode.BOOK_OUT_OF_STOCK);
            }

            tempTotalCost += book.getFinalPrice() * bookRequest.getQuantity();
            totalQuantity += bookRequest.getQuantity();
            books.add(book);
            quantities.put(book.getId(), bookRequest.getQuantity());
        }

        // 2. Lấy Event và Check Rule
        Optional<Event> activeEventOpt = eventApplicationService.getHighestPriorityActiveEvent();
        Event appliedEvent = null;
        Map<Long, Double> eventDiscountedPrices = new HashMap<>();
        int totalDiscountValue = 0;

        if (activeEventOpt.isPresent()) {
            Event event = activeEventOpt.get();
            
            // Validate Rule
            boolean isEligible = eventApplicationService.checkEventRule(event, user, tempTotalCost, totalQuantity);
            
            if (isEligible) {
                // Áp dụng giảm giá
                for (Book book : books) {
                    if (eventApplicationService.isBookInEventTarget(event, book)) {
                        Double originalPrice = book.getFinalPrice();
                        Double discountedPrice = eventApplicationService.calculateDiscountedPrice(event, originalPrice);
                        int qty = quantities.get(book.getId());

                        eventDiscountedPrices.put(book.getId(), discountedPrice);
                        totalDiscountValue += (int)((originalPrice - discountedPrice) * qty);
                        appliedEvent = event;
                    }
                }
            }
        }

        // 3. Tính lại tổng tiền sau khi có (hoặc không) giảm giá
        double finalBooksCost = 0.0;
        for (Book book : books) {
            Double price = eventDiscountedPrices.getOrDefault(book.getId(), book.getFinalPrice());
            finalBooksCost += price * quantities.get(book.getId());
        }

        double totalCost = finalBooksCost + shippingMethod.getPrice();

        // 4. Lưu Bill
        Bill bill = Bill.builder()
                .user(user)
                .paymentMethod(paymentMethod)
                .shippingMethod(shippingMethod)
                .totalCost(totalCost)
                .status(BillStatus.PENDING)
                .build();

        Bill savedBill = billRepository.save(bill);

        // 5. Lưu BillBooks
        for (Book book : books) {
            Double priceToSave = eventDiscountedPrices.getOrDefault(book.getId(), book.getFinalPrice());
            int qty = quantities.get(book.getId());

            BillBook billBook = BillBook.builder()
                    .bill(savedBill)
                    .book(book)
                    .priceSnapshot(priceToSave)
                    .quantity(qty)
                    .build();

            billBookRepository.save(billBook);

            // Giảm tồn kho
            book.setStock(book.getStock() - qty);
            bookRepository.save(book);
        }

        // 6. Lưu Log
        if (appliedEvent != null) {
            eventApplicationService.logEventApplication(appliedEvent, user, savedBill, totalDiscountValue);
        }

        return convertToDTO(savedBill);
    }

    @Transactional
    public BillDTO updateBillStatus(Long id, UpdateBillStatusRequest request) {
        Bill bill = billRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.BILL_NOT_FOUND));

        BillStatus oldStatus = bill.getStatus();
        BillStatus newStatus = request.getStatus();

        validateStatusTransition(oldStatus, newStatus);

        bill.setStatus(newStatus);

        if (newStatus == BillStatus.APPROVED && request.getApprovedById() != null) {
            User approver = userRepository.findById(request.getApprovedById())
                    .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
            bill.setApprovedBy(approver);
            bill.setApprovedAt(LocalDateTime.now());
        }

        if (newStatus == BillStatus.CANCELED) {
            for (BillBook billBook : bill.getBillBooks()) {
                try {
                    Book book = billBook.getBook();
                    if (book != null) {
                        bookRepository.findById(book.getId()).ifPresent(existingBook -> {
                            existingBook.setStock(existingBook.getStock() + billBook.getQuantity());
                            bookRepository.save(existingBook);
                        });
                    }
                } catch (Exception e) {
                }
            }
        }

        Bill updatedBill = billRepository.save(bill);
        return convertToDTO(updatedBill);
    }

    @Transactional
    public void deleteBill(Long id) {
        Bill bill = billRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.BILL_NOT_FOUND));

        if (bill.getStatus() != BillStatus.PENDING && bill.getStatus() != BillStatus.CANCELED) {
            throw new RuntimeException("Can only delete pending or cancelled bills");
        }

        if (bill.getStatus() == BillStatus.PENDING) {
            for (BillBook billBook : bill.getBillBooks()) {
                try {
                    Book book = billBook.getBook();
                    if (book != null) {
                        bookRepository.findById(book.getId()).ifPresent(existingBook -> {
                            existingBook.setStock(existingBook.getStock() + billBook.getQuantity());
                            bookRepository.save(existingBook);
                        });
                    }
                } catch (Exception e) {
                }
            }
        }

        billRepository.delete(bill);
    }

    private void validateStatusTransition(BillStatus oldStatus, BillStatus newStatus) {
        switch (oldStatus) {
            case PENDING:
                if (newStatus != BillStatus.APPROVED && newStatus != BillStatus.CANCELED) {
                    throw new RuntimeException("Invalid status transition from PENDING");
                }
                break;
            case APPROVED:
                if (newStatus != BillStatus.SHIPPING && newStatus != BillStatus.CANCELED) {
                    throw new RuntimeException("Invalid status transition from APPROVED");
                }
                break;
            case SHIPPING:
                if (newStatus != BillStatus.SHIPPED && newStatus != BillStatus.CANCELED) {
                    throw new RuntimeException("Invalid status transition from SHIPPING");
                }
                break;
            case SHIPPED:
                if (newStatus != BillStatus.COMPLETED) {
                    throw new RuntimeException("Invalid status transition from SHIPPED");
                }
                break;
            case COMPLETED:
            case CANCELED:
                throw new RuntimeException("Cannot change status of completed or cancelled bill");
        }
    }

    private BillDTO convertToDTO(Bill bill) {
        List<BillBookDTO> bookDTOs = bill.getBillBooks().stream()
                .map(this::convertBillBookToDTO)
                .collect(Collectors.toList());

        return BillDTO.builder()
                .id(bill.getId())
                .userId(bill.getUser().getId())
                .userName(bill.getUser().getUsername())
                .paymentMethodId(bill.getPaymentMethod().getId())
                .paymentMethodName(bill.getPaymentMethod().getName())
                .shippingMethodId(bill.getShippingMethod().getId())
                .shippingMethodName(bill.getShippingMethod().getName())
                .shippingCost(bill.getShippingMethod().getPrice())
                .totalCost(bill.getTotalCost())
                .approvedById(bill.getApprovedBy() != null ? bill.getApprovedBy().getId() : null)
                .approvedByName(bill.getApprovedBy() != null ? bill.getApprovedBy().getUsername() : null)
                .status(bill.getStatus())
                .books(bookDTOs)
                .createdAt(bill.getCreatedAt())
                .updatedAt(bill.getUpdatedAt())
                .approvedAt(bill.getApprovedAt())
                .build();
    }

    private BillBookDTO convertBillBookToDTO(BillBook billBook) {
        Book book = billBook.getBook();
        double subtotal = billBook.getPriceSnapshot() * billBook.getQuantity();

        return BillBookDTO.builder()
                .bookId(book.getId())
                .bookName(book.getName())
                .bookImageUrl(book.getBookImageUrl())
                .priceSnapshot(billBook.getPriceSnapshot())
                .quantity(billBook.getQuantity())
                .subtotal(subtotal)
                .build();
    }
}