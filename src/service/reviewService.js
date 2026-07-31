import api from '../api/axios';

export const reviewService = {
  // Public — ✅ FIXED: was calling non-existent /products/{id}/reviews.
  // The real route is the public GET /reviews, filtered via ?product_id=
  getByProduct: (productId, params = {}) =>
    api.get('/reviews', { params: { ...params, product_id: productId } }),

  // Customer
  create: (data)            => api.post('/reviews', data),
  getMyReviews: (params)    => api.get('/reviews/my', { params }), // ✅ now matches the new backend route
  update: (id, data)        => api.put(`/reviews/${id}`, data),
  delete: (id)              => api.delete(`/reviews/${id}`),

  // Admin + Staff
  getAll: (params)          => api.get('/admin/reviews', { params }),
  getOne: (id)               => api.get(`/admin/reviews/${id}`),

  // Admin only — ✅ FIXED: was calling non-existent /approve and /reject
  // endpoints. The real backend route is PUT /admin/reviews/{id}/status
  // with a { status } body.
  updateStatus: (id, status) => api.put(`/admin/reviews/${id}/status`, { status }),
  approve: (id)               => api.put(`/admin/reviews/${id}/status`, { status: 'approved' }),
  reject: (id)                => api.put(`/admin/reviews/${id}/status`, { status: 'rejected' }),
  adminDelete: (id)           => api.delete(`/admin/reviews/${id}`),
};