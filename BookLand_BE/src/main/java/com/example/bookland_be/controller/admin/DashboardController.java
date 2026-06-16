package com.example.bookland_be.controller.admin;

import com.example.bookland_be.dto.response.RevenueDataPoint;
import com.example.bookland_be.dto.response.TopBookDTO;
import com.example.bookland_be.dto.response.TopCustomerDTO;
import com.example.bookland_be.dto.response.ApiResponse;
import com.example.bookland_be.service.DashboardService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/dashboard")
@RequiredArgsConstructor
@SecurityRequirement(name = "BearerAuth")
@PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_MANAGER')")
public class DashboardController {

    private final DashboardService dashboardService;

    /**
     * Doanh thu theo khoảng thời gian.
     * @param period  "week" | "month" | "year"
     */
    @GetMapping("/revenue")
    public ApiResponse<List<RevenueDataPoint>> getRevenue(
            @RequestParam(defaultValue = "month") String period) {
        List<RevenueDataPoint> data = switch (period.toLowerCase()) {
            case "week"  -> dashboardService.getRevenueByWeek();
            case "year"  -> dashboardService.getRevenueByYear();
            default      -> dashboardService.getRevenueByMonth();
        };
        return ApiResponse.<List<RevenueDataPoint>>builder().result(data).build();
    }

    /**
     * Top sách bán chạy nhất.
     * @param period "week" | "month" | "year"
     * @param limit  số lượng sách trả về (mặc định 10)
     */
    @GetMapping("/top-books")
    public ApiResponse<List<TopBookDTO>> getTopBooks(
            @RequestParam(defaultValue = "month") String period,
            @RequestParam(defaultValue = "10") int limit) {
        return ApiResponse.<List<TopBookDTO>>builder()
                .result(dashboardService.getTopSellingBooks(period, limit))
                .build();
    }

    /**
     * Top khách hàng mua nhiều nhất.
     * @param period "week" | "month" | "year"
     * @param limit  số lượng khách trả về (mặc định 10)
     */
    @GetMapping("/top-customers")
    public ApiResponse<List<TopCustomerDTO>> getTopCustomers(
            @RequestParam(defaultValue = "month") String period,
            @RequestParam(defaultValue = "10") int limit) {
        return ApiResponse.<List<TopCustomerDTO>>builder()
                .result(dashboardService.getTopCustomers(period, limit))
                .build();
    }
}
