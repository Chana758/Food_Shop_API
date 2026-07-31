import axios from '../api/axios';

const paymentService = {
  create: async (payload) => {
    const isFormData = payload instanceof FormData;
    const res = await axios.post('/payments', payload, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {},
    });
    return res.data.data;
  },

  //  NEW: ត្រូវផ្គូផ្គងជាមួយ route POST /payments/{id}/check-status (ដែលកែពី GET → POST)
  checkStatus: async (id) => {
    const res = await axios.post(`/payments/${id}/check-status`);
    return res.data; // { status, paid, data?, message? }
  },

  getAll: async (params = {}) => {
    const res = await axios.get('/admin/payments', { params });
    return res.data.data;
  },

  getOne: async (id) => {
    const res = await axios.get(`/admin/payments/${id}`);
    return res.data.data;
  },

  confirm: async (id) => {
    const res = await axios.put(`/admin/payments/${id}/confirm`);
    return res.data.data;
  },

  reject: async (id) => {
    const res = await axios.put(`/admin/payments/${id}/reject`);
    return res.data.data;
  },

  refund: async (id) => {
    const res = await axios.put(`/admin/payments/${id}/refund`);
    return res.data.data;
  },

  remove: async (id) => {
    const res = await axios.delete(`/admin/payments/${id}`);
    return res.data;
  },
};

export default paymentService;