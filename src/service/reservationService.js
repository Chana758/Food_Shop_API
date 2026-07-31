import api from '../api/axios';

export const reservationService = {
  // ======================================
  // CUSTOMER
  // ======================================
  getMyReservations: ()    => api.get('/reservations'),
  create: (data)           => api.post('/reservations', data),
  cancel: (id)             => api.post(`/reservations/${id}/cancel`),

  // ======================================
  // ADMIN + STAFF (view)
  // ======================================
  getAll: (params)         => api.get('/admin/reservations', { params }),
  getStats: ()              => api.get('/admin/reservations/stats'),
  getOne: (id)              => api.get(`/admin/reservations/${id}`),

  // ======================================
  // ADMIN ONLY (write)
  // `data` may include an optional `{ message }` — when present, the backend
  // emails that note to the customer along with the status-change notice.
  // ======================================
  confirm:  (id, data = {}) => api.put(`/admin/reservations/${id}/confirm`, data),
  reject:   (id, data = {}) => api.put(`/admin/reservations/${id}/reject`, data),
  complete: (id, data = {}) => api.put(`/admin/reservations/${id}/complete`, data),
  delete:   (id)             => api.delete(`/admin/reservations/${id}`),
};