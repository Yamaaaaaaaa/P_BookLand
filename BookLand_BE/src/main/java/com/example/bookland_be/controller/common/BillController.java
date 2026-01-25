package com.example.bookland_be.controller.common;

import com.example.bookland_be.dto.*;
import com.example.bookland_be.dto.request.CreateBillRequest;
import com.example.bookland_be.dto.request.PreviewBillRequest;
import com.example.bookland_be.dto.request.UpdateBillStatusRequest;
import com.example.bookland_be.entity.Bill.BillStatus;
import com.example.bookland_be.service.BillPreviewService;
import com.example.bookland_be.service.BillService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/bills")
@RequiredArgsConstructor
@SecurityRequirement(name = "BearerAuth")
public class BillController {

    private final BillService billService;
    private final BillPreviewService billPreviewService;

    @GetMapping
    public ResponseEntity<Page<BillDTO>> getAllBills(
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) BillStatus status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime toDate,
            @RequestParam(required = false) Double minCost,
            @RequestParam(required = false) Double maxCost,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDirection
    ) {
        Sort.Direction direction = sortDirection.equalsIgnoreCase("ASC")
                ? Sort.Direction.ASC
                : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));

        Page<BillDTO> bills = billService.getAllBills(userId, status, fromDate, toDate,
                minCost, maxCost, pageable);
        return ResponseEntity.ok(bills);
    }

    @GetMapping("/{id}")
    public ResponseEntity<BillDTO> getBillById(@PathVariable Long id) {
        return ResponseEntity.ok(billService.getBillById(id));
    }

    /**
     * Preview bill - Xem giá và event trước khi tạo đơn
     */
    @PostMapping("/preview")
    public ResponseEntity<BillPreviewDTO> previewBill(@Valid @RequestBody PreviewBillRequest request) {
        return ResponseEntity.ok(billPreviewService.previewBill(request));
    }

    /**
     * Tạo bill - Tự động áp dụng event có priority cao nhất
     */
    @PostMapping
    public ResponseEntity<BillDTO> createBill(@Valid @RequestBody CreateBillRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(billService.createBill(request));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<BillDTO> updateBillStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateBillStatusRequest request) {
        return ResponseEntity.ok(billService.updateBillStatus(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBill(@PathVariable Long id) {
        billService.deleteBill(id);
        return ResponseEntity.noContent().build();
    }
}