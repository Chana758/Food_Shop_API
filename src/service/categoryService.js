// src/service/categoryService.js
import api from '../api/axios';

export const categoryService = {
    getAll: async () => {
        const response = await api.get('/categories');
        return response.data;
    },

    getById: async (id) => {
        const response = await api.get(`/categories/${id}`);
        return response.data;
    },

    create: async (data) => {
        // axios instance (api/axios.js) លុប Content-Type ស្វ័យប្រវត្តិពេលឃើញថា data ជា FormData
        const response = await api.post('/categories', data);
        return response.data;
    },

    // បន្ថែមមុខងារ update
    update: async (id, data) => {
        // ការប្រើ POST ជាមួយ _method: PUT គឺចាំបាច់សម្រាប់ Multipart data ក្នុង Laravel
        // (_method ត្រូវ append ទៅក្នុង FormData ដោយខាង Component មុនពេលហៅ function នេះ)
        const response = await api.post(`/categories/${id}`, data);
        return response.data;
    },

    // បន្ថែមមុខងារ delete
    delete: async (id) => {
        const response = await api.delete(`/categories/${id}`);
        return response.data;
    }
};