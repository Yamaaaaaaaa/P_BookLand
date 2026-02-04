import axios from 'axios';
import { toast } from 'react-toastify';

const axiosClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request Interceptor
axiosClient.interceptors.request.use(
    async (config) => {
        // Determine if we are in admin area or shop area to use appropriate token
        const isAdminCallback = window.location.pathname.startsWith('/admin');
        const tokenKey = isAdminCallback ? 'adminToken' : 'customerToken';
        let token = localStorage.getItem(tokenKey);

        // Auto Refresh Token for Customer (Shop)
        if (!isAdminCallback) {
            const refreshToken = localStorage.getItem('customerRefreshToken');
            const hasRefreshToken = refreshToken && refreshToken !== 'undefined';
            let shouldRefresh = false;

            if (token) {
                try {
                    const { jwtDecode } = await import('jwt-decode');
                    const decoded: any = jwtDecode(token);
                    const now = Date.now() / 1000;
                    
                    // If token is about to expire (less than 5 minutes)
                    if (decoded.exp && decoded.exp - now < 300) {
                        shouldRefresh = true;
                    }
                } catch (error) {
                    console.error('Error decoding token, attempting refresh', error);
                    shouldRefresh = true;
                }
            } else if (hasRefreshToken) {
                // No access token but we have a refresh token
                shouldRefresh = true;
            }

            if (shouldRefresh && hasRefreshToken) {
                try {
                    // Call refresh API directly to avoid circular dependency with authService
                    const response = await axios.post(`${import.meta.env.VITE_API_URL}/auth/refresh`, {
                        token: refreshToken
                    });

                    if (response.data && response.data.code === 1000 && response.data.result) {
                        // Backend returns 'token' in result for refresh endpoint
                        const { token: newToken } = response.data.result;
                        
                        if (newToken) {
                            localStorage.setItem('customerToken', newToken);
                            token = newToken; // Use new token for this request
                            console.log('Successfully refreshed access token');
                        }
                    }
                } catch (refreshError) {
                    console.error('Failed to refresh token', refreshError);
                }
            }
        }

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response Interceptor
axiosClient.interceptors.response.use(
    (response) => {
        return response.data ? response.data : response;
    },
    (error) => {
        
        // Handle common errors (401, 403, etc.)
        if (error.response) {
            const status = error.response.status;
            // const data = error.response.data;

            // Handle Backend Error Codes if present
            // if (data && data.code && data.message) {
                 // toast.error(data.message); // Disabled automatic toast
                 // return Promise.reject(error);
            // }

            // Fallback for standard HTTP errors
            switch (status) {
                case 400:
                    // toast.error('Bad Request: Please check your input.');
                    break;
                case 401:
                    // toast.error('Unauthorized access. Please login.');
                    break;
                case 403:
                    // toast.error('Forbidden: You do not have permission.');
                    break;
                case 404:
                    // toast.error('Not Found: The requested resource could not be found.');
                    break;
                case 500:
                    // Keep 500 as it's usually a server crash
                    toast.error('Internal Server Error: Something went wrong on the server.');
                    break;
                default:
                    // toast.error(`An error occurred: ${status}`);
                    break;
            }
        } else if (error.request) {
            toast.error('No response received from server. Please check your network connection.');
        } else {
            toast.error(`Error setting up request: ${error.message}`);
        }
        
        return Promise.reject(error);
    }
);

export default axiosClient;
