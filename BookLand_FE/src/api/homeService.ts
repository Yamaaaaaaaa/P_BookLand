import axiosClient from './axiosClient';
import type { ApiResponse } from '../types/api';
import type { HomeSection } from '../types/HomeSection';

const homeService = {
    getHomeData: () => {
        return axiosClient.get<any, ApiResponse<string>>('/home');
    },

    getAdminHomeData: () => {
        return axiosClient.get<any, string>('/admin/home');
    },

    // ── Home Sections ───────────────────────────────────────────────────────
    getHomeSections: () => {
        return axiosClient.get<any, ApiResponse<HomeSection[]>>('/api/home-sections');
    },

    updateHomeSectionsOrder: (sectionIds: number[]) => {
        return axiosClient.put<any, ApiResponse<HomeSection[]>>('/api/home-sections/order', { sectionIds });
    },

    toggleHomeSectionVisibility: (id: number, visible: boolean) => {
        return axiosClient.patch<any, ApiResponse<HomeSection[]>>(
            `/api/home-sections/${id}/visibility?visible=${visible}`
        );
    },

    resetHomeSectionsToDefault: () => {
        return axiosClient.post<any, ApiResponse<HomeSection[]>>('/api/home-sections/reset');
    },
};

export default homeService;
