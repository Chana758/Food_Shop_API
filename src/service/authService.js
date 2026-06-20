import api from '../api/axios';

export const authService = {
    register: async (userData) => {  // userData ទទួលបានមកពី Form ក្នុង Component Register.jsx
        try {
            // ផ្ញើទិន្នន័យទៅកាន់ API endpoint '/register'
            const response = await api.post('/register', userData);
            // Axios បានបំបែក JSON ឱ្យយើងស្រេច ដូច្នេះត្រឡប់តែ .data ទៅឱ្យ Component វិញ
            return response.data;
        } catch (error) {
            // បើ Backend ផ្ញើ Error មក (ដូចជា Validation Error) យកកំហុសនោះមកប្រើ
            // បើគ្មាន Error ពី Backend ទេ (ដាច់បណ្តាញ) ប្រើសារ 'Network Error' ជំនួស
            throw error.response?.data || { message: 'Network Error' };
        }
    },
    // មុខងារសម្រាប់ Login (credentials គឺជា Object ដែលមាន email និង password)
    login: async (credentials) => {
        try {
            // ១. ផ្ញើ Email/Password ទៅកាន់ API endpoint '/login'
            const response = await api.post('/login', credentials);
            // ២. បើ Backend ឆ្លើយតបមកវិញនូវ access_token មានន័យថា Login ជោគជ័យ
            if (response.data.access_token) {
                // ៣. រក្សាទុក Token ក្រោម key 'access_token' — ត្រូវតែដូចគ្នានឹង key
                //    ដែល axios.js interceptor អានចូល បើមិនដូច្នេះ Authorization header
                //    នឹងមិនត្រូវបានភ្ជាប់ ទោះបី login ជោគជ័យក៏ដោយ
                localStorage.setItem('access_token', response.data.access_token);
                // ៤. រក្សាទុកព័ត៌មាន User (ត្រូវប្រើ JSON.stringify ព្រោះ localStorage រក្សាទុកបានតែអត្ថបទ)
                localStorage.setItem('user', JSON.stringify(response.data.user));
            }
            // ៥. ផ្ញើលទ្ធផល (ទិន្នន័យ User និង Token) ត្រឡប់ទៅឱ្យ Component វិញ
            return response.data;
        } catch (error) {
            // ៦. ប្រសិនបើមានកំហុស (ឧ. លេខសម្ងាត់ខុស) ផ្ញើកំហុសនោះបន្តទៅឱ្យ Component
            // បើគ្មានកំហុសពី Backend ទេ (ដូចជាដាច់អ៊ីនធឺណិត) ប្រើសារ 'Network Error' ជំនួស
            throw error.response?.data || { message: 'Network Error' };
        }
    },

    logout: async () => {
        try {
            await api.post('/logout'); // បាញ់ទៅប្រាប់ Laravel ឱ្យលុប Token ក្នុង DB
        } finally {
            // ទោះបាញ់ជោគជ័យឬអត់ ក៏ត្រូវលុបចេញពី Browser ដែរ (key ត្រូវដូចគ្នានឹង login)
            localStorage.removeItem('access_token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
    },
};