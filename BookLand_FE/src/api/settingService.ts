import axiosClient from "./axiosClient";
import type { ApiResponse } from "../types/api";

const settingService = {
    getAllSettings: () => {
        return axiosClient.get<any, ApiResponse<Record<string, string>>>('/api/settings');
    },

    saveSettings: (settings: Record<string, string>) => {
        return axiosClient.post<any, ApiResponse<string>>('/api/admin/settings', settings);
    }
};

export default settingService;
