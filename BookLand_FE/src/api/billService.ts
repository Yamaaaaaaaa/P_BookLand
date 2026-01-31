import axiosClient from './axiosClient';
import type { ApiResponse, Page } from '../types/api';
import type { Bill, CreateBillRequest, UpdateBillStatusRequest } from '../types/Bill';

interface BillQueryParams {
    userId?: number;
    status?: string;
    fromDate?: string;
    toDate?: string;
    minCost?: number;
    maxCost?: number;
    page?: number;
    size?: number;
    sortBy?: string;
    sortDirection?: string;
}

export interface PreviewBillRequest {
    books: { bookId: number; quantity: number }[];
    shippingMethodId: number;
}


// Assuming BillPreviewDTO is same as Bill for now or close enough, but actually need to define it if I want strict type
// For now leaving as 'any' for result or defining a quick interface if needed.
// The doc has BillPreviewDTO.
export interface BillPreviewDTO {
    books: any[]; // define stricter if needed
    originalSubtotal: number;
    discountedSubtotal: number;
    shippingCost: number;
    totalSaved: number;
    grandTotal: number;
    hasEventApplied: boolean;
    appliedEventId: number;
}

const billService = {
    getAllBills: (params?: BillQueryParams) => {
        return axiosClient.get<any, ApiResponse<Page<Bill>>>('/api/bills', { params });
    },
    getBillById: (id: number) => {
        return axiosClient.get<any, ApiResponse<Bill>>(`/api/bills/${id}`);
    },
    createBill: (data: CreateBillRequest) => {
        return axiosClient.post<any, ApiResponse<Bill>>('/api/bills', data);
    },
    previewBill: (data: PreviewBillRequest) => {
        return axiosClient.post<any, ApiResponse<BillPreviewDTO>>('/api/bills/preview', data);
    },
    updateBillStatus: (id: number, data: UpdateBillStatusRequest) => {
        return axiosClient.patch<any, ApiResponse<Bill>>(`/api/bills/${id}/status`, data);
    },
    deleteBill: (id: number) => {
        return axiosClient.delete<any, ApiResponse<void>>(`/api/bills/${id}`);
    }
};

export default billService;
