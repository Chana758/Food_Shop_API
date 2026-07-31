import api from '../api/axios';

export const contactService = {
  // Public
  send: (data)       => api.post('/contacts', data),

  // Admin + Staff
  getAll: (params)   => api.get('/admin/contacts', { params }),
  getStats: ()        => api.get('/admin/contacts/stats'),
  getOne: (id)        => api.get(`/admin/contacts/${id}`),

  // Admin only
  // FIX: was api.put(...) but the Laravel route is defined as
  // Route::post('/{id}/reply', ...) in api.php — PUT caused a 405.
  reply: (id, data)   => api.post(`/admin/contacts/${id}/reply`, data),
  delete: (id)        => api.delete(`/admin/contacts/${id}`),
};