// src/service/categoryService.js
import api from '../api/axios';

export const categoryService = {
    //Add params: page, per_page, search
    getAll: async ({ page = 1, per_page = 15, search = '' } = {}) => {
        const response = await api.get('/categories', {
            params: { page, per_page, search }
        });
        return response.data;
    },

    getById: async (id) => {
        const response = await api.get(`/categories/${id}`);
        return response.data;
    },

    create: async (data) => {
        const response = await api.post('/categories', data);
        return response.data;
    },

    update: async (id, data) => {
        const response = await api.post(`/categories/${id}`, data);
        return response.data;
    },

    delete: async (id) => {
        const response = await api.delete(`/categories/${id}`);
        return response.data;
    }
};