import axios from '../api/axios';

const orderService = {
  // ─── CUSTOMER ────────────────────────────────────────────────────────────

  // GET /api/orders  →  customer's own orders (ownership-filtered by backend)
  getMyOrders: async (params = {}) => {
    const res = await axios.get('/orders', { params });
    return res.data.data;
  },

  // GET /api/orders/:id
  getOne: async (id) => {
    const res = await axios.get(`/orders/${id}`);
    return res.data.data;
  },

  // POST /api/orders
  create: async (payload) => {
    const res = await axios.post('/orders', payload);
    return res.data.data;
  },

  // POST /api/orders/:id/cancel
  cancel: async (id) => {
    const res = await axios.post(`/orders/${id}/cancel`);
    return res.data.data;
  },

  // ─── ADMIN ───────────────────────────────────────────────────────────────

  // GET /api/admin/orders  →  all orders with filters
  getAll: async (params = {}) => {
    const res = await axios.get('/admin/orders', { params });
    return res.data.data;
  },

  // GET /api/admin/orders/stats
  getStats: async () => {
    const res = await axios.get('/admin/orders/stats');
    return res.data.data;
  },

  // PUT /api/admin/orders/:id  (status / notes / table_id)
  // ✅ FIXED: was /orders/:id  → now /admin/orders/:id
  update: async (id, payload) => {
    const res = await axios.put(`/admin/orders/${id}`, payload);
    return res.data.data;
  },

  // DELETE /api/admin/orders/:id
  // ✅ FIXED: was /orders/:id  → now /admin/orders/:id
  remove: async (id) => {
    const res = await axios.delete(`/admin/orders/${id}`);
    return res.data;
  },

  // PUT /api/admin/orders/:id/assign-rider
  assignRider: async (id, riderId) => {
    const res = await axios.put(`/admin/orders/${id}/assign-rider`, { rider_id: riderId });
    return res.data.data;
  },

  // PUT /api/admin/orders/:id/delivery-status
  updateDeliveryStatus: async (id, deliveryStatus) => {
    const res = await axios.put(`/admin/orders/${id}/delivery-status`, { delivery_status: deliveryStatus });
    return res.data.data;
  },
};

export default orderService;