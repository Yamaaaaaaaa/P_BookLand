import axios from 'axios';

const axiosClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request Interceptor
axiosClient.interceptors.request.use(
    (config) => {
        // Determine if we are in admin area or shop area to use appropriate token
        // This is a simple check based on URL, adjust if route structure differs
        const isAdminCallback = window.location.pathname.startsWith('/admin');
        const tokenKey = isAdminCallback ? 'adminToken' : 'customerToken';
        const token = localStorage.getItem(tokenKey);

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
            
            // Server responded with a status code outside of 2xx
            switch (status) {
                case 400:
                    console.error('Bad Request: Please check your input.');
                    break;
                case 401:
                     // Determine redirect path based on context
                    // const isAdmin = window.location.pathname.startsWith('/admin');
                    // const loginPath = isAdmin ? '/admin/login' : '/login';
                    
                    // Optional: Redirect to login or clear token
                    // window.location.href = loginPath; 
                    console.error('Unauthorized access. Please login.');
                    break;
                case 403:
                    console.error('Forbidden: You do not have permission to perform this action.');
                    break;
                case 404:
                    console.error('Not Found: The requested resource could not be found.');
                    break;
                case 500:
                    console.error('Internal Server Error: Something went wrong on the server.');
                    break;
                default:
                    console.error(`An error occurred: ${status}`);
            }
        } else if (error.request) {
            // The request was made but no response was received
            console.error('No response received from server. Please check your network connection.');
        } else {
            // Something happened in setting up the request that triggered an Error
            console.error('Error setting up request:', error.message);
        }
        
        return Promise.reject(error);
    }
);

export default axiosClient;
