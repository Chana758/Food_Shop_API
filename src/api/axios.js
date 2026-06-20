import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: 'http://127.0.0.1:8000/api',
    headers: {
        Accept: 'application/json',
    },
});

// Inject auth token
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token');

        // ផ្ញើ token ជានិច្ច បើមាន — ឱ្យ backend middleware (auth:sanctum/auth:api)
        // ជាអ្នកសម្រេចថា route ត្រូវការ auth ឬអត់ មិនមែន duplicate logic នៅ frontend ទេ
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        // កុំ set Content-Type ដោយដៃពេលផ្ញើ FormData (មាន file)
        // ឱ្យ axios/browser គណនា boundary ស្វ័យប្រវត្តិ បើមិនដូច្នេះ Laravel parse multipart មិនបាន
        if (config.data instanceof FormData) {
            delete config.headers['Content-Type'];
        } else if (!config.headers['Content-Type']) {
            config.headers['Content-Type'] = 'application/json';
        }

        return config;
    },
    (error) => Promise.reject(error)
);

// Handle blocked account
axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 403) {
            alert('Your account has been blocked by the administrator.');

            localStorage.removeItem('access_token');
            window.location.href = '/login';
        }

        return Promise.reject(error);
    }
);

export default axiosInstance;