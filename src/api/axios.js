import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: 'http://127.0.0.1:8000/api',
    headers: {
        Accept: 'application/json',
    },
});

axiosInstance.interceptors.request.use(
    (config) => {
        //  sessionStorage ➜ ដាច់ដោយឡែកក្នុង tab នីមួយៗ — ការពារ admin/customer ជាន់គ្នា
        const token = sessionStorage.getItem('access_token');

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        if (config.data instanceof FormData) {
            delete config.headers['Content-Type'];
        } else if (!config.headers['Content-Type']) {
            config.headers['Content-Type'] = 'application/json';
        }

        return config;
    },
    (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 403) {
            const message = error.response.data.message || 'Access Forbidden';

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