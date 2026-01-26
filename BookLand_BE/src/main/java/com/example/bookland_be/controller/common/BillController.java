package com.example.bookland_be.controller.common;

import com.example.bookland_be.dto.*;
import com.example.bookland_be.dto.request.CreateBillRequest;
import com.example.bookland_be.dto.request.PreviewBillRequest;
import com.example.bookland_be.dto.request.UpdateBillStatusRequest;
import com.example.bookland_be.dto.response.ApiResponse;
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
    public ApiResponse<Page<BillDTO>> getAllBills(
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
        return ApiResponse.<Page<BillDTO>>builder().result(bills).build();
    }

    @GetMapping("/{id}")
    public ApiResponse<BillDTO> getBillById(@PathVariable Long id) {
        return ApiResponse.<BillDTO>builder().result(billService.getBillById(id)).build();
    }

    /**
     * Preview bill - Xem giá và event trước khi tạo đơn
     */
    @PostMapping("/preview")
    public ApiResponse<BillPreviewDTO> previewBill(@Valid @RequestBody PreviewBillRequest request) {
        return ApiResponse.<BillPreviewDTO>builder().result(billPreviewService.previewBill(request)).build();
    }

    /**
     * Tạo bill - Tự động áp dụng event có priority cao nhất
     */
    @PostMapping
    public ApiResponse<BillDTO> createBill(@Valid @RequestBody CreateBillRequest request) {
        return ApiResponse.<BillDTO>builder().result(billService.createBill(request)).build();
    }

    @PatchMapping("/{id}/status")
    public ApiResponse<BillDTO> updateBillStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateBillStatusRequest request) {
        return ApiResponse.<BillDTO>builder().result(billService.updateBillStatus(id, request)).build();
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteBill(@PathVariable Long id) {
        billService.deleteBill(id);
        return ApiResponse.<Void>builder().build();
    }
}