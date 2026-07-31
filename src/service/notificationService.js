import api from '../api/axios';

export const notificationService = {
  // User's own notifications + unread_count comes back in meta
  getAll: (params = {}) => api.get('/notifications', { params }),
  getOne: (id)          => api.get(`/notifications/${id}`),
  markAsRead: (id)      => api.put(`/notifications/${id}/read`),
  // FIX: matches Route::post('/read-all', ...) in api.php
  markAllAsRead: ()     => api.post('/notifications/read-all'),
  delete: (id)          => api.delete(`/notifications/${id}`),

  // Admin only — manually send a notification to a user
  send: (data)          => api.post('/admin/notifications', data),
};