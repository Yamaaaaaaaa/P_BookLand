package com.example.bookland_be.service;


import com.example.bookland_be.dto.*;
import com.example.bookland_be.dto.request.BillBookRequest;
import com.example.bookland_be.dto.request.CreateBillRequest;
import com.example.bookland_be.dto.request.UpdateBillStatusRequest;
import com.example.bookland_be.entity.*;
import com.example.bookland_be.entity.Bill.BillStatus;
import com.example.bookland_be.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
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

    public List<BillDTO> getAllBills() {
        return billRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<BillDTO> getUserBills(Long userId) {
        return billRepository.findByUserId(userId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<BillDTO> getBillsByStatus(BillStatus status) {
        return billRepository.findByStatus(status).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public BillDTO getBillById(Long id) {
        Bill bill = billRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Bill not found with id: " + id));
        return convertToDTO(bill);
    }

    @Transactional
    public BillDTO createBill(CreateBillRequest request) {
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        PaymentMethod paymentMethod = paymentMethodRepository.findById(request.getPaymentMethodId())
                .orElseThrow(() -> new RuntimeException("Payment method not found"));

        ShippingMethod shippingMethod = shippingMethodRepository.findById(request.getShippingMethodId())
                .orElseThrow(() -> new RuntimeException("Shipping method not found"));

        // Calculate total cost
        double booksCost = 0.0;
        for (BillBookRequest bookRequest : request.getBooks()) {
            Book book = bookRepository.findById(bookRequest.getBookId())
                    .orElseThrow(() -> new RuntimeException("Book not found: " + bookRequest.getBookId()));

            if (book.getStock() < bookRequest.getQuantity()) {
                throw new RuntimeException("Insufficient stock for book: " + book.getName());
            }

            booksCost += book.getFinalPrice() * bookRequest.getQuantity();
        }

        double totalCost = booksCost + shippingMethod.getPrice();

        // Create bill
        Bill bill = Bill.builder()
                .user(user)
                .paymentMethod(paymentMethod)
                .shippingMethod(shippingMethod)
                .totalCost(totalCost)
                .status(BillStatus.PENDING)
                .build();

        Bill savedBill = billRepository.save(bill);

        // Create bill books and update stock
        for (BillBookRequest bookRequest : request.getBooks()) {
            Book book = bookRepository.findById(bookRequest.getBookId())
                    .orElseThrow(() -> new RuntimeException("Book not found"));

            BillBook billBook = BillBook.builder()
                    .bill(savedBill)
                    .book(book)
                    .priceSnapshot(book.getFinalPrice())
                    .quantity(bookRequest.getQuantity())
                    .build();

            billBookRepository.save(billBook);

            // Update stock
            book.setStock(book.getStock() - bookRequest.getQuantity());
            bookRepository.save(book);
        }

        return convertToDTO(savedBill);
    }

    @Transactional
    public BillDTO updateBillStatus(Long id, UpdateBillStatusRequest request) {
        Bill bill = billRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Bill not found with id: " + id));

        BillStatus oldStatus = bill.getStatus();
        BillStatus newStatus = request.getStatus();

        // Validate status transition
        validateStatusTransition(oldStatus, newStatus);

        bill.setStatus(newStatus);

        if (newStatus == BillStatus.APPROVED && request.getApprovedById() != null) {
            User approver = userRepository.findById(request.getApprovedById())
                    .orElseThrow(() -> new RuntimeException("Approver not found"));
            bill.setApprovedBy(approver);
            bill.setApprovedAt(LocalDateTime.now());
        }

        // If cancelled, restore stock
        if (newStatus == BillStatus.CANCELED) {
            for (BillBook billBook : bill.getBillBooks()) {
                Book book = billBook.getBook();
                book.setStock(book.getStock() + billBook.getQuantity());
                bookRepository.save(book);
            }
        }

        Bill updatedBill = billRepository.save(bill);
        return convertToDTO(updatedBill);
    }

    @Transactional
    public void deleteBill(Long id) {
        Bill bill = billRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Bill not found with id: " + id));

        if (bill.getStatus() != BillStatus.PENDING && bill.getStatus() != BillStatus.CANCELED ) {
            throw new RuntimeException("Can only delete pending or cancelled bills");
        }

        // Restore stock if not already cancelled
        if (bill.getStatus() == BillStatus.PENDING) {
            for (BillBook billBook : bill.getBillBooks()) {
                Book book = billBook.getBook();
                book.setStock(book.getStock() + billBook.getQuantity());
                bookRepository.save(book);
            }
        }

        billRepository.delete(bill);
    }

    private void validateStatusTransition(BillStatus oldStatus, BillStatus newStatus) {
        // Define allowed transitions
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
