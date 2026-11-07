// src/api/axios.js
import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "https://food-shop-backend-xivl.onrender.com/api",
    headers: {
        Accept: 'application/json',
    },
    // Render free tier can take a while to wake up, so allow more time
    timeout: 20000,
});

/* ───────────── Auto-retry (GET only) ─────────────
   Temporary 5xx errors, timeouts and network blips are retried silently
   so the customer usually never sees them. */
const MAX_RETRIES = 1;
const RETRY_DELAY_MS = 1200;
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const shouldRetry = (error) => {
    const config = error.config;
    if (!config || error.code === 'ERR_CANCELED') return false;
    if ((config.method || 'get').toLowerCase() !== 'get') return false;

    const status = error.response?.status;
    const isNetworkOrTimeout = !error.response;           // offline, timeout, CORS
    const isServerError = status >= 500 && status !== 501; // 500, 502, 503, 504...

    return (isNetworkOrTimeout || isServerError) && (config.__retryCount || 0) < MAX_RETRIES;
};

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
    async (error) => {

        // Silent retry for temporary failures
        if (shouldRetry(error)) {
            error.config.__retryCount = (error.config.__retryCount || 0) + 1;
            await sleep(RETRY_DELAY_MS * error.config.__retryCount);
            return axiosInstance(error.config);
        }

        // Handle 403
        if (error.response?.status === 403) {
            const message = error.response.data?.message || 'Access Forbidden';

            // Blocked account
            if (message.toLowerCase().includes('blocked')) {
                alert('Your account has been blocked by the administrator.');

                sessionStorage.removeItem('access_token');
                sessionStorage.removeItem('user');
                sessionStorage.removeItem('currentUser');

                window.location.href = '/login';
            } else {
                console.warn('Unauthorized access to this resource:', message);
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