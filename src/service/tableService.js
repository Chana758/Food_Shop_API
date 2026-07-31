import axios from '../api/axios';

const tableService = {
  getAll: async () => {
    const res = await axios.get('/tables');
    return res.data.data;
  },

  getOne: async (id) => {
    const res = await axios.get(`/tables/${id}`);
    return res.data.data;
  },

  create: async (payload) => {
    const res = await axios.post('/tables', payload);
    return res.data.data;
  },

  update: async (id, payload) => {
    const res = await axios.put(`/tables/${id}`, payload);
    return res.data.data;
  },

  remove: async (id) => {
    const res = await axios.delete(`/tables/${id}`);
    return res.data;
  },
};

export default tableService;