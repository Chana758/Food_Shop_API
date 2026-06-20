// src/service/productService.js
import api from '../api/axios';

export const productService = {
    getAll: async () => {
        const response = await api.get('/products');
        return response.data;
    },

    getById: async (id) => {
        const response = await api.get(`/products/${id}`);
        return response.data;
    },

    create: async (data) => {
        // axios instance (api/axios.js) លុប Content-Type ស្វ័យប្រវត្តិពេលឃើញថា data ជា FormData
        const response = await api.post('/products', data);
        return response.data;
    },

    update: async (id, data) => {
        // _method: 'PUT' ត្រូវ append ទៅក្នុង FormData ដោយខាង Component មុនពេលហៅ function នេះ
        const response = await api.post(`/products/${id}`, data);
        return response.data;
    },

    delete: async (id) => {
        const response = await api.delete(`/products/${id}`);
        return response.data;
    },

    // ប្រើ 'q' ឱ្យត្រូវនឹង Controller, encodeURIComponent ការពារតួអក្សរពិសេសក្នុង query
    search: async (query) => {
        const response = await api.get(`/search?q=${encodeURIComponent(query)}`);
        return response.data;
    },

    forceDelete: async (id) => {
        const response = await api.delete(`/products/${id}/force-delete`);
        return response.data;
    },

    restore: async (id) => {
        const response = await api.post(`/products/${id}/restore`);
        return response.data;
    }
};