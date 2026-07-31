import { useState, useEffect, useCallback } from 'react';
import { reservationService } from '../service/reservationService';

// Helper: safely extract an array from an API response, regardless of
// whether the backend returns a plain array, a Laravel paginate() object
// nested under `data`, or double-wrapped as { status, data: { data: [...] } }.
const extractList = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.data?.data)) return payload.data.data;
  return [];
};

// ======================================
// CUSTOMER — reservation ខ្លួនឯង
// ======================================
export const useReservation = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading]           = useState(false);
  const [error,   setError]             = useState(null);

  const fetchMyReservations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await reservationService.getMyReservations();
      setReservations(extractList(res.data));
    } catch (err) {
      setError('Failed to load reservations.');
      setReservations([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchMyReservations(); }, [fetchMyReservations]);

  const createReservation = async (data) => {
    const res = await reservationService.create(data);
    const created = res.data?.data ?? res.data;
    setReservations(prev => [created, ...(Array.isArray(prev) ? prev : [])]);
    return created;
  };

  const cancelReservation = async (id) => {
    await reservationService.cancel(id);
    setReservations(prev =>
      (Array.isArray(prev) ? prev : []).map(r => r.id === id ? { ...r, status: 'cancelled' } : r)
    );
  };

  return {
    reservations,
    loading,
    error,
    refetch: fetchMyReservations,
    createReservation,
    cancelReservation,
  };
};

// ======================================
// ADMIN + STAFF — manage all reservations
// ======================================
export const useAdminReservation = () => {
  const [reservations, setReservations] = useState([]);
  const [stats,        setStats]        = useState(null);
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState(null);

  const fetchReservations = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const [listRes, statsRes] = await Promise.all([
        reservationService.getAll(params),
        reservationService.getStats(),
      ]);
      setReservations(extractList(listRes.data));
      setStats(statsRes.data?.data ?? statsRes.data);
    } catch (err) {
      setError('Failed to load reservations.');
      setReservations([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchReservations(); }, [fetchReservations]);

  // Optimistic update helpers
  const _updateOne = (id, patch) =>
    setReservations(prev => (Array.isArray(prev) ? prev : []).map(r => r.id === id ? { ...r, ...patch } : r));

  // `payload` is optional: { message } — forwarded to the backend so it can
  // email the customer with the admin's note alongside the status update.
  const confirmReservation = async (id, payload = {}) => {
    const res = await reservationService.confirm(id, payload);
    const updated = res.data?.data ?? res.data?.reservation ?? { status: 'confirmed' };
    _updateOne(id, updated);
    setStats(prev => prev ? ({
      ...prev,
      pending:   Math.max(0, (prev.pending   ?? 1) - 1),
      confirmed: (prev.confirmed ?? 0) + 1,
    }) : prev);
    return updated;
  };

  const rejectReservation = async (id, payload = {}) => {
    const res = await reservationService.reject(id, payload);
    const updated = res.data?.data ?? res.data?.reservation ?? { status: 'rejected' };
    _updateOne(id, updated);
    setStats(prev => prev ? ({
      ...prev,
      pending: Math.max(0, (prev.pending ?? 1) - 1),
    }) : prev);
    return updated;
  };

  const completeReservation = async (id, payload = {}) => {
    const res = await reservationService.complete(id, payload);
    const updated = res.data?.data ?? res.data?.reservation ?? { status: 'completed' };
    _updateOne(id, updated);
    setStats(prev => prev ? ({
      ...prev,
      confirmed: Math.max(0, (prev.confirmed ?? 1) - 1),
    }) : prev);
    return updated;
  };

  const deleteReservation = async (id) => {
    await reservationService.delete(id);
    setReservations(prev => (Array.isArray(prev) ? prev : []).filter(r => r.id !== id));
    setStats(prev => prev ? ({ ...prev, total: Math.max(0, (prev.total ?? 1) - 1) }) : prev);
  };

  return {
    reservations,
    stats,
    loading,
    error,
    refetch: fetchReservations,
    confirmReservation,
    rejectReservation,
    completeReservation,
    deleteReservation,
  };
};