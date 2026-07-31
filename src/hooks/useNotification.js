import { useState, useEffect, useCallback } from 'react';
import { notificationService } from '../service/notificationService';

export const useNotification = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount]     = useState(0);
  const [loading, setLoading]             = useState(false);
  const [error, setError]                 = useState(null);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // FIX: unread_count already comes back in the same /notifications
      // response (under `meta`), so a separate /unread-count call —
      // which doesn't exist as a route — is unnecessary and was 404'ing.
      const res = await notificationService.getAll();
      setNotifications(res.data?.data?.data ?? []); // Laravel paginator: data.data
      setUnreadCount(res.data?.meta?.unread_count ?? 0);
    } catch (err) {
      setError('Failed to load notifications.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

  const markAsRead = useCallback(async (id) => {
    await notificationService.markAsRead(id);
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, is_read: true } : n))
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  }, []);

  const markAllAsRead = useCallback(async () => {
    // FIX: was api.put('/notifications/mark-all-read') → 405.
    // Correct call now goes through notificationService.markAllAsRead()
    // which POSTs to /notifications/read-all.
    await notificationService.markAllAsRead();
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    setUnreadCount(0);
  }, []);

  const deleteNotification = useCallback(async (id) => {
    const notif = notifications.find(n => n.id === id);
    await notificationService.delete(id);
    setNotifications(prev => prev.filter(n => n.id !== id));
    if (notif && !notif.is_read) {
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  }, [notifications]);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    refetch: fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  };
};