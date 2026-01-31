import axiosClient from './axiosClient';
import type { ApiResponse } from '../types/api';
import type { AuthenticationResponse, LoginRequest, LoginResponse, RefreshRequest, LogoutRequest } from '../types/Auth';

const authService = {
    login: (data: LoginRequest) => {
        return axiosClient.post<any, ApiResponse<LoginResponse>>('/auth/login', data);
    },
    logout: (data: LogoutRequest) => {
        return axiosClient.post<any, ApiResponse<void>>('/auth/logout', data);
    },
    refresh: (data: RefreshRequest) => {
        return axiosClient.post<any, ApiResponse<AuthenticationResponse>>('/auth/refresh', data);
    },
    introspect: (token: string) => {
        return axiosClient.post<any, ApiResponse<{ valid: boolean }>>('/auth/introspect', { token, tokenType: 'Bearer' });
    }
};

export default authService;
