// src/service/productService.js
import api from '../api/axios';

export const productService = {
    // add params: page, per_page, search
    getAll: async ({ page = 1, per_page = 15, search = '', category_slug = '' } = {}) => {
        const response = await api.get('/products', {
            params: { page, per_page, search, category_slug }
        });
        return response.data;
    },

    getById: async (id) => {
        const response = await api.get(`/products/${id}`);
        return response.data;
    },

    create: async (data) => {
        const response = await api.post('/products', data);
        return response.data;
    },

    update: async (id, data) => {
        const response = await api.post(`/products/${id}`, data);
        return response.data;
    },

    delete: async (id) => {
        const response = await api.delete(`/products/${id}`);
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