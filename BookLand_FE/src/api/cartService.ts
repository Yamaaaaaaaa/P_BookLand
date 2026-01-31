import axiosClient from './axiosClient';
import type { ApiResponse } from '../types/api';
import type { Cart, AddToCartRequest, UpdateCartItemRequest } from '../types/Cart';

const cartService = {
    getUserCart: (userId: number) => {
        return axiosClient.get<any, ApiResponse<Cart>>(`/api/cart/${userId}`);
    },
    addToCart: (userId: number, data: AddToCartRequest) => {
        return axiosClient.post<any, ApiResponse<Cart>>(`/api/cart/${userId}/items`, data);
    },
    updateCartItem: (userId: number, bookId: number, data: UpdateCartItemRequest) => {
        return axiosClient.put<any, ApiResponse<Cart>>(`/api/cart/${userId}/items/${bookId}`, data);
    },
    removeFromCart: (userId: number, bookId: number) => {
        return axiosClient.delete<any, ApiResponse<Cart>>(`/api/cart/${userId}/items/${bookId}`);
    },
    clearCart: (userId: number) => {
        return axiosClient.delete<any, ApiResponse<void>>(`/api/cart/${userId}/clear`);
    }
};

export default cartService;
