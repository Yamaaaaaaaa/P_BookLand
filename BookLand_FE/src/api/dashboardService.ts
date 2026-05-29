import axiosClient from './axiosClient';
import type { ApiResponse } from '../types/api';

export type DashboardPeriod = 'week' | 'month' | 'year';

export interface RevenueDataPoint {
    label: string;
    revenue: number;
    orderCount: number;
}

export interface TopBook {
    bookId: number;
    bookName: string;
    bookImageUrl?: string;
    authorName: string;
    totalQuantitySold: number;
    totalRevenue: number;
}

export interface TopCustomer {
    userId: number;
    username: string;
    email: string;
    totalOrders: number;
    totalSpent: number;
}

const dashboardService = {
    getRevenue: (period: DashboardPeriod = 'month') =>
        axiosClient.get<any, ApiResponse<RevenueDataPoint[]>>('/api/admin/dashboard/revenue', {
            params: { period },
        }),

    getTopBooks: (period: DashboardPeriod = 'month', limit = 10) =>
        axiosClient.get<any, ApiResponse<TopBook[]>>('/api/admin/dashboard/top-books', {
            params: { period, limit },
        }),

    getTopCustomers: (period: DashboardPeriod = 'month', limit = 10) =>
        axiosClient.get<any, ApiResponse<TopCustomer[]>>('/api/admin/dashboard/top-customers', {
            params: { period, limit },
        }),
};

export default dashboardService;
