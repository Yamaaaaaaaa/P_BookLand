package com.example.bookland_be.service;

import com.example.bookland_be.dto.response.RevenueDataPoint;
import com.example.bookland_be.dto.response.TopBookDTO;
import com.example.bookland_be.dto.response.TopCustomerDTO;
import com.example.bookland_be.entity.Bill;
import com.example.bookland_be.repository.BillBookRepository;
import com.example.bookland_be.repository.BillRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final BillRepository billRepository;
    private final BillBookRepository billBookRepository;

    /**
     * Doanh thu theo tuần (7 ngày gần nhất, mỗi điểm = 1 ngày).
     */
    @Transactional(readOnly = true)
    public List<RevenueDataPoint> getRevenueByWeek() {
        LocalDateTime end = LocalDateTime.now();
        LocalDateTime start = end.minusDays(6).toLocalDate().atStartOfDay();

        List<Bill> bills = billRepository.findCompletedBillsBetween(start, end);

        // Group by day-of-week label
        DateTimeFormatter dayFmt = DateTimeFormatter.ofPattern("dd/MM");
        Map<LocalDate, Double> revenueByDay = new LinkedHashMap<>();
        Map<LocalDate, Long> countByDay = new LinkedHashMap<>();

        for (int i = 6; i >= 0; i--) {
            LocalDate day = LocalDate.now().minusDays(i);
            revenueByDay.put(day, 0.0);
            countByDay.put(day, 0L);
        }

        for (Bill bill : bills) {
            LocalDate day = bill.getCreatedAt().toLocalDate();
            revenueByDay.merge(day, bill.getTotalCost(), Double::sum);
            countByDay.merge(day, 1L, Long::sum);
        }

        return revenueByDay.entrySet().stream()
                .map(e -> RevenueDataPoint.builder()
                        .label(e.getKey().format(dayFmt))
                        .revenue(e.getValue())
                        .orderCount(countByDay.get(e.getKey()))
                        .build())
                .collect(Collectors.toList());
    }

    /**
     * Doanh thu theo tháng (12 tháng trong năm hiện tại, mỗi điểm = 1 tháng).
     */
    @Transactional(readOnly = true)
    public List<RevenueDataPoint> getRevenueByMonth() {
        int year = LocalDate.now().getYear();
        LocalDateTime start = LocalDateTime.of(year, 1, 1, 0, 0);
        LocalDateTime end = LocalDateTime.of(year, 12, 31, 23, 59, 59);

        List<Bill> bills = billRepository.findCompletedBillsBetween(start, end);

        Map<Integer, Double> revenueByMonth = new LinkedHashMap<>();
        Map<Integer, Long> countByMonth = new LinkedHashMap<>();
        for (int m = 1; m <= 12; m++) {
            revenueByMonth.put(m, 0.0);
            countByMonth.put(m, 0L);
        }

        for (Bill bill : bills) {
            int month = bill.getCreatedAt().getMonthValue();
            revenueByMonth.merge(month, bill.getTotalCost(), Double::sum);
            countByMonth.merge(month, 1L, Long::sum);
        }

        String[] monthNames = {"T1", "T2", "T3", "T4", "T5", "T6",
                               "T7", "T8", "T9", "T10", "T11", "T12"};

        return revenueByMonth.entrySet().stream()
                .map(e -> RevenueDataPoint.builder()
                        .label(monthNames[e.getKey() - 1])
                        .revenue(e.getValue())
                        .orderCount(countByMonth.get(e.getKey()))
                        .build())
                .collect(Collectors.toList());
    }

    /**
     * Doanh thu theo năm (5 năm gần nhất, mỗi điểm = 1 năm).
     */
    @Transactional(readOnly = true)
    public List<RevenueDataPoint> getRevenueByYear() {
        int currentYear = LocalDate.now().getYear();
        LocalDateTime start = LocalDateTime.of(currentYear - 4, 1, 1, 0, 0);
        LocalDateTime end = LocalDateTime.of(currentYear, 12, 31, 23, 59, 59);

        List<Bill> bills = billRepository.findCompletedBillsBetween(start, end);

        Map<Integer, Double> revenueByYear = new LinkedHashMap<>();
        Map<Integer, Long> countByYear = new LinkedHashMap<>();
        for (int y = currentYear - 4; y <= currentYear; y++) {
            revenueByYear.put(y, 0.0);
            countByYear.put(y, 0L);
        }

        for (Bill bill : bills) {
            int year = bill.getCreatedAt().getYear();
            revenueByYear.merge(year, bill.getTotalCost(), Double::sum);
            countByYear.merge(year, 1L, Long::sum);
        }

        return revenueByYear.entrySet().stream()
                .map(e -> RevenueDataPoint.builder()
                        .label(String.valueOf(e.getKey()))
                        .revenue(e.getValue())
                        .orderCount(countByYear.get(e.getKey()))
                        .build())
                .collect(Collectors.toList());
    }

    /* ─── Top Selling Books ─── */

    private DateRange getDateRange(String period) {
        LocalDateTime end = LocalDateTime.now();
        LocalDateTime start;
        switch (period.toLowerCase()) {
            case "week":
                start = end.minusDays(6).toLocalDate().atStartOfDay();
                break;
            case "year":
                start = LocalDateTime.of(LocalDate.now().getYear(), 1, 1, 0, 0);
                break;
            case "month":
            default:
                start = LocalDateTime.of(LocalDate.now().getYear(),
                        LocalDate.now().getMonthValue(), 1, 0, 0);
                break;
        }
        return new DateRange(start, end);
    }

    @Transactional(readOnly = true)
    public List<TopBookDTO> getTopSellingBooks(String period, int limit) {
        DateRange range = getDateRange(period);
        Pageable pageable = PageRequest.of(0, limit);
        return billBookRepository.findTopSellingBooks(range.start, range.end, pageable);
    }

    @Transactional(readOnly = true)
    public List<TopCustomerDTO> getTopCustomers(String period, int limit) {
        DateRange range = getDateRange(period);
        Pageable pageable = PageRequest.of(0, limit);
        return billRepository.findTopCustomers(range.start, range.end, pageable);
    }

    private record DateRange(LocalDateTime start, LocalDateTime end) {}
}
