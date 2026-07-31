/**
 * useAdminBell.js
 *
 * Aggregates all actionable items that need the admin's attention
 * and exposes them as a unified list for the bell-icon dropdown in
 * AdminHeader. Polls every 30 s and can be manually refreshed.
 *
 * Data sources (all existing endpoints — no new backend code needed):
 *   - GET /api/admin/payments?status=pending      → pending payments
 *   - GET /api/admin/reservations/stats           → pending reservations
 *   - GET /api/admin/contacts/stats               → unread contact messages
 *   - GET /api/admin/dashboard-stats              → unassigned deliveries
 *
 * Each item shape:
 *   { id, type, icon, title, sub, link, color, bg, count }
 */
import { useState, useEffect, useCallback } from 'react';
import axiosInstance from '../api/axios';

const POLL_MS = 30_000;

const useAdminBell = () => {
  const [items, setItems]       = useState([]);
  const [totalCount, setTotal]  = useState(0);
  const [loading, setLoading]   = useState(true);

  const fetch = useCallback(async () => {
    try {
      // All 4 sources in parallel — any failure is caught individually
      const [paymentsRes, reservationsRes, contactsRes, dashRes] = await Promise.all([
        axiosInstance.get('/admin/payments', { params: { status: 'pending', per_page: 1 } }).catch(() => null),
        axiosInstance.get('/admin/reservations/stats').catch(() => null),
        axiosInstance.get('/admin/contacts/stats').catch(() => null),
        axiosInstance.get('/admin/dashboard-stats').catch(() => null),
      ]);

      // Extract counts safely from each response
      // Payments: paginated list → total from meta
      const pendingPayments = paymentsRes?.data?.data?.total ?? 0;

      // Reservations stats: { data: { total, pending, confirmed, today } }
      const pendingReservations =
        reservationsRes?.data?.data?.pending ??
        reservationsRes?.data?.pending ?? 0;

      // Contact stats: { data: { total, unread, read, replied } }
      const unreadContacts =
        contactsRes?.data?.data?.unread ??
        contactsRes?.data?.unread ?? 0;

      // Dashboard stats: unassigned deliveries
      const unassignedDeliveries =
        dashRes?.data?.stats?.unassigned_delivery_count ?? 0;

      // Build the items list — only include non-zero counts
      const next = [];

      if (pendingPayments > 0) {
        next.push({
          id:    'payments',
          type:  'payment',
          title: `${pendingPayments} Pending Payment${pendingPayments > 1 ? 's' : ''}`,
          sub:   'KHQR receipts awaiting confirmation',
          link:  '/admin/payments',
          color: 'text-yellow-700',
          bg:    'bg-yellow-50',
          dot:   'bg-yellow-500',
          count: pendingPayments,
        });
      }

      if (unassignedDeliveries > 0) {
        next.push({
          id:    'delivery',
          type:  'delivery',
          title: `${unassignedDeliveries} Unassigned Deliver${unassignedDeliveries > 1 ? 'ies' : 'y'}`,
          sub:   'Delivery orders waiting for a rider',
          link:  '/admin/delivery',
          color: 'text-orange-700',
          bg:    'bg-orange-50',
          dot:   'bg-orange-500',
          count: unassignedDeliveries,
        });
      }

      if (pendingReservations > 0) {
        next.push({
          id:    'reservations',
          type:  'reservation',
          title: `${pendingReservations} Pending Reservation${pendingReservations > 1 ? 's' : ''}`,
          sub:   'Table bookings awaiting confirmation',
          link:  '/admin/reservations',
          color: 'text-blue-700',
          bg:    'bg-blue-50',
          dot:   'bg-blue-500',
          count: pendingReservations,
        });
      }

      if (unreadContacts > 0) {
        next.push({
          id:    'contacts',
          type:  'contact',
          title: `${unreadContacts} Unread Message${unreadContacts > 1 ? 's' : ''}`,
          sub:   'Customer contact messages to review',
          link:  '/admin/contacts',
          color: 'text-purple-700',
          bg:    'bg-purple-50',
          dot:   'bg-purple-500',
          count: unreadContacts,
        });
      }

      setItems(next);
      setTotal(next.reduce((sum, n) => sum + n.count, 0));
    } catch (err) {
      console.error('useAdminBell fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
    const interval = setInterval(fetch, POLL_MS);
    return () => clearInterval(interval);
  }, [fetch]);

  return {
    items,       // array of notification items
    totalCount,  // total badge count on the bell
    loading,
    refresh: fetch,
  };
};

export default useAdminBell;