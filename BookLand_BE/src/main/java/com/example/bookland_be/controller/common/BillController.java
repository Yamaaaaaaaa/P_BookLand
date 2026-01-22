package com.example.bookland_be.controller.common;


import com.example.bookland_be.dto.*;
import com.example.bookland_be.dto.request.CreateBillRequest;
import com.example.bookland_be.dto.request.UpdateBillStatusRequest;
import com.example.bookland_be.entity.Bill.BillStatus;
import com.example.bookland_be.service.BillService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bills")
@RequiredArgsConstructor
@SecurityRequirement(name = "BearerAuth")

public class BillController {

    private final BillService billService;

    @GetMapping
    public ResponseEntity<List<BillDTO>> getAllBills() {
        return ResponseEntity.ok(billService.getAllBills());
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<BillDTO>> getUserBills(@PathVariable Long userId) {
        return ResponseEntity.ok(billService.getUserBills(userId));
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<BillDTO>> getBillsByStatus(@PathVariable BillStatus status) {
        return ResponseEntity.ok(billService.getBillsByStatus(status));
    }

    @GetMapping("/{id}")
    public ResponseEntity<BillDTO> getBillById(@PathVariable Long id) {
        return ResponseEntity.ok(billService.getBillById(id));
    }

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