import api from '../api/axios';

export const authService = {

  register: async (userData) => {
    try {
      const response = await api.post('/register', userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Network Error' };
    }
  },

  login: async (credentials) => {
    try {
      const response = await api.post('/login', credentials);

      if (response.data.access_token) {
        // sessionStorage — ដាច់ដោយឡែកក្នុង tab នីមួយៗ
        sessionStorage.setItem('access_token', response.data.access_token);
        sessionStorage.setItem('user', JSON.stringify(response.data.user));
        sessionStorage.setItem('currentUser', JSON.stringify(response.data.user)); // legacy key
      }

      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Network Error' };
    }
  },

  logout: async () => {
    try {
      await api.post('/logout');
    } catch {
      // ignore — still clear local state below
    } finally {
      sessionStorage.removeItem('access_token');
      sessionStorage.removeItem('user');
      sessionStorage.removeItem('currentUser');
    }
  },

  getCurrentUser: () => {
    try {
      const user = sessionStorage.getItem('user');
      return user ? JSON.parse(user) : null;
    } catch {
      return null;
    }
  },

  isLoggedIn: () => !!sessionStorage.getItem('access_token'),
};