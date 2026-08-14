import { useState, useEffect, useCallback, useRef } from 'react';
import axiosInstance from '../api/axios';

const POLL_MS = 30_000;

const useAdminBell = () => {
  const [items, setItems]       = useState([]);
  const [totalCount, setTotal]  = useState(0);
  const [loading, setLoading]   = useState(true);

  // ✅ FIX (429 storm): guards against overlapping calls to fetch().
  // Without this, React 18 StrictMode's dev-only double-invoke of mount
  // effects — visible in the reported error stack as
  // "reconnectPassiveEffects" / "doubleInvokeEffectsOnFiber" — fired this
  // effect twice almost simultaneously on every mount, each kicking off
  // its OWN set of 4 parallel GET requests (payments/stats,
  // reservations/stats, contacts/stats, dashboard-stats) — 8 requests
  // instead of 4 on a single page load. The same double-fire risk exists
  // any time `fetch` is invoked again (poll tick) before the previous
  // call has resolved (e.g. a slow/stalled network). Skipping a call
  // while one is already in flight removes that duplication entirely.
  const isFetchingRef = useRef(false);

  const fetch = useCallback(async () => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;

    try {
      const [paymentsRes, reservationsRes, contactsRes, dashRes] = await Promise.all([
        axiosInstance.get('/admin/payments/stats').catch(() => null),
        axiosInstance.get('/admin/reservations/stats').catch(() => null),
        axiosInstance.get('/admin/contacts/stats').catch(() => null),
        axiosInstance.get('/admin/dashboard-stats').catch(() => null),
      ]);

      // Prefer the dedicated non-cash pending count (see
      // PaymentController::stats()) over the raw by_status breakdown,
      // which used to count 'cash' payments the same as 'khqr' — that
      // was a separate bug (COD orders falsely showing as "payment
      // awaiting confirmation").
      const byStatus = paymentsRes?.data?.data?.by_status || [];
      const pendingItem = Array.isArray(byStatus) ? byStatus.find(s => s.status === 'pending') : null;
      const legacyPendingPayments = pendingItem ? Number(pendingItem.count) : 0;

      const pendingPayments =
        paymentsRes?.data?.data?.pending_confirmation_count
        ?? legacyPendingPayments;

      const pendingReservations =
        reservationsRes?.data?.data?.pending ??
        reservationsRes?.data?.pending ?? 0;

      const unreadContacts =
        contactsRes?.data?.data?.unread ??
        contactsRes?.data?.unread ?? 0;

      const unassignedDeliveries =
        dashRes?.data?.stats?.unassigned_delivery_count ?? 0;

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
      isFetchingRef.current = false;
    }
  }, []);

  useEffect(() => {
    fetch();
    const interval = setInterval(fetch, POLL_MS);
    return () => clearInterval(interval);
  }, [fetch]);

  return {
    items,
    totalCount,
    loading,
    refresh: fetch,
  };
};

export default useAdminBell;