import axiosClient from './axiosClient';

const uploadService = {
    getAllImages: () => {
        return axiosClient.get<any, any>('/api/uploads/images');
    },
    uploadImage: (file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        return axiosClient.post<any, any>('/api/uploads/image', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    },
    uploadMultipleImages: (files: File[]) => {
        const formData = new FormData();
        files.forEach((file) => {
            formData.append('files', file);
        });
        return axiosClient.post<any, any>('/api/uploads/images', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    },
};

export default uploadService;
