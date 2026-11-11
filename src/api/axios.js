// src/api/axios.js
import axios from 'axios';
import { API_URL, wakeServer, isServerWaking, markServerAwake } from './serverWake';

const axiosInstance = axios.create({
    baseURL: API_URL,
    headers: {
        Accept: 'application/json',
    },
    // Normal requests. While the free server is waking up, requests wait for
    // the wake-up ping first (see the request interceptor), so 20 s is enough.
    timeout: 20000,
});

/* ───────────── Auto-retry (GET only) ─────────────
   Temporary 5xx errors, timeouts and network blips are retried silently
   so the customer usually never sees them. Before retrying we wait until
   the server answers /ping, which covers Render's cold start. */
const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 1000;
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

// Requests to these endpoints answer 401 for a wrong password;
// that must not log the user out or reload the page.
const AUTH_ENDPOINTS = ['/login', '/register'];
const isAuthRequest = (config) =>
    AUTH_ENDPOINTS.some((path) => (config?.url || '').endsWith(path));

const clearSession = () => {
    sessionStorage.removeItem('access_token');
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('currentUser');
};

const goToLogin = () => {
    if (window.location.pathname !== '/login') window.location.href = '/login';
};

// Request interceptor
axiosInstance.interceptors.request.use(
    async (config) => {
        // Server is still starting (Render free plan): wait for it instead
        // of letting this request time out.
        if (isServerWaking()) await wakeServer();

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
    (response) => {
        markServerAwake();
        return response;
    },
    async (error) => {

        // Silent retry for temporary failures
        if (shouldRetry(error)) {
            error.config.__retryCount = (error.config.__retryCount || 0) + 1;
            // No answer at all usually means the server is asleep: wake it first
            if (!error.response) await wakeServer({ force: true });
            await sleep(RETRY_DELAY_MS * error.config.__retryCount);
            return axiosInstance(error.config);
        }

        if (error.response) markServerAwake();

        // Handle 403
        if (error.response?.status === 403) {
            const message = error.response.data?.message || 'Access Forbidden';

            // Blocked account
            if (message.toLowerCase().includes('blocked')) {
                const isKhmer = (localStorage.getItem('language') || 'en') === 'kh';
                alert(isKhmer
                    ? 'គណនីរបស់អ្នកត្រូវបានបិទដោយអ្នកគ្រប់គ្រង។'
                    : 'Your account has been blocked by the administrator.');

                clearSession();
                goToLogin();
            } else {
                console.warn('Unauthorized access to this resource:', message);
            }
        }

        // Handle 401 (expired or invalid token), but not a failed login attempt
        if (error.response?.status === 401 && !isAuthRequest(error.config)) {
            clearSession();
            goToLogin();
        }

        return Promise.reject(error);
    }
);

export default axiosInstance;
