import axios from 'axios';

// src/api/axios.js
const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "https://food-shop-backend-xivl.onrender.com/api",
    headers: {
        Accept: 'application/json',
    },
    timeout: 10000,
});

// Request interceptor
axiosInstance.interceptors.request.use(
    (config) => {
        // Get token
        const token = sessionStorage.getItem('access_token');

        // Add Bearer token
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        // Handle FormData / JSON
        if (config.data instanceof FormData) {
            delete config.headers['Content-Type'];
        } else if (!config.headers['Content-Type']) {
            config.headers['Content-Type'] = 'application/json';
        }

        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor
axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {

        // Handle 403
        if (error.response?.status === 403) {
            const message = error.response.data.message || 'Access Forbidden';

            // Blocked account
            if (message.toLowerCase().includes('blocked')) {
                alert('Your account has been blocked by the administrator.');

                sessionStorage.removeItem('access_token');
                sessionStorage.removeItem('user');
                sessionStorage.removeItem('currentUser');

                window.location.href = '/login';
            } else {
                console.warn(
                    'Unauthorized access to this resource:',
                    message
                );
            }
        }

        // Handle 401
        if (error.response?.status === 401) {
            sessionStorage.removeItem('access_token');
            sessionStorage.removeItem('user');
            sessionStorage.removeItem('currentUser');

            window.location.href = '/login';
        }

        return Promise.reject(error);
    }
);

export default axiosInstance;