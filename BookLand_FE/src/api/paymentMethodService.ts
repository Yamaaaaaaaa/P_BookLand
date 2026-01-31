import axiosClient from './axiosClient';
import type { ApiResponse, Page } from '../types/api';
import type { PaymentMethod } from '../types/PaymentMethod';

interface PaymentMethodRequest {
    name: string;
    providerCode?: string;
    isOnline: boolean;
    description?: string;
}

const paymentMethodService = {
    getAll: (params?: any) => {
        return axiosClient.get<any, ApiResponse<Page<PaymentMethod>>>('/payment-methods', { params });
    },
    getById: (id: number) => {
        return axiosClient.get<any, ApiResponse<PaymentMethod>>(`/payment-methods/${id}`);
    },
    create: (data: PaymentMethodRequest) => {
        return axiosClient.post<any, ApiResponse<PaymentMethod>>('/payment-methods', data);
    },
    update: (id: number, data: PaymentMethodRequest) => {
        return axiosClient.put<any, ApiResponse<PaymentMethod>>(`/payment-methods/${id}`, data);
    },
    delete: (id: number) => {
        return axiosClient.delete<any, ApiResponse<void>>(`/payment-methods/${id}`);
    }
};

export default paymentMethodService;
