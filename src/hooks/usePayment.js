/**
 * usePayment.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Hook សម្រាប់ Admin Payment Management
 * - fetch payments ជាមួយ auto-refresh រៀងរាល់ 15 វិនាទី
 * - confirm / refund / delete payment
 * - connect ទៅ routes/api.php: /api/admin/payments/*
 * ─────────────────────────────────────────────────────────────────────────────
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import axios from '../api/axios'; // ✅ axiosInstance ដែលមាន Bearer token

const BASE_URL = '/admin/payments';
const POLL_MS  = 15_000; // auto-refresh រៀងរាល់ 15 វិនាទី

const usePayment = () => {
  const [payments, setPayments]           = useState([]);
  const [pendingCount, setPendingCount]   = useState(0);   // ← badge សម្រាប់ Dashboard
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState(null);
  const [lastUpdated, setLastUpdated]     = useState(null); // ← បង្ហាញពេលចុងក្រោយ refresh
  const intervalRef                       = useRef(null);

  // ── Fetch all payments (with optional status filter) ──────────────────────
  const fetchPayments = useCallback(async (params = {}) => {
    try {
      // មិន setLoading(true) ពេល background refresh ដើម្បីមិន flicker UI
      if (!payments.length) setLoading(true);
      setError(null);

      const res = await axios.get(BASE_URL, { params });

      // Backend return: { status: 'success', data: { data: [...], total, ... } }
      const raw = res.data?.data;
      const list = Array.isArray(raw) ? raw
                 : Array.isArray(raw?.data) ? raw.data
                 : [];

      setPayments(list);
      setPendingCount(list.filter(p => p.status === 'pending').length);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('usePayment fetch error:', err.response ?? err);
      setError('Failed to load payments. Check your connection.');
    } finally {
      setLoading(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Auto-refresh រៀងរាល់ 15 វិនាទី ───────────────────────────────────────
  useEffect(() => {
    fetchPayments();

    intervalRef.current = setInterval(() => {
      fetchPayments();
    }, POLL_MS);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchPayments]);

  // ── Confirm payment (pending → paid) ─────────────────────────────────────
  // PUT /api/admin/payments/:id/confirm
  const confirmPayment = async (id) => {
    // Optimistic UI update ភ្លាមៗ
    setPayments(prev =>
      prev.map(p => p.id === id
        ? { ...p, status: 'paid', paid_at: new Date().toISOString() }
        : p
      )
    );
    setPendingCount(prev => Math.max(0, prev - 1));

    try {
      const res = await axios.put(`${BASE_URL}/${id}/confirm`);
      // Update ជាមួយ data ពិតពី backend
      const updated = res.data?.data;
      if (updated) {
        setPayments(prev => prev.map(p => p.id === id ? { ...p, ...updated } : p));
      }
    } catch (err) {
      console.error('confirmPayment error:', err.response ?? err);
      // Revert optimistic update
      fetchPayments();
      throw err;
    }
  };

  // ── Refund payment (paid → refunded) ─────────────────────────────────────
  // PUT /api/admin/payments/:id/refund
  const refundPayment = async (id) => {
    setPayments(prev =>
      prev.map(p => p.id === id ? { ...p, status: 'refunded' } : p)
    );

    try {
      const res = await axios.put(`${BASE_URL}/${id}/refund`);
      const updated = res.data?.data;
      if (updated) {
        setPayments(prev => prev.map(p => p.id === id ? { ...p, ...updated } : p));
      }
    } catch (err) {
      console.error('refundPayment error:', err.response ?? err);
      fetchPayments();
      throw err;
    }
  };

  // ── Delete payment ────────────────────────────────────────────────────────
  // DELETE /api/admin/payments/:id
  const removePayment = async (id) => {
    const removed = payments.find(p => p.id === id);
    setPayments(prev => prev.filter(p => p.id !== id));
    if (removed?.status === 'pending') {
      setPendingCount(prev => Math.max(0, prev - 1));
    }

    try {
      await axios.delete(`${BASE_URL}/${id}`);
    } catch (err) {
      console.error('removePayment error:', err.response ?? err);
      // Restore on failure
      if (removed) setPayments(prev => [removed, ...prev]);
      throw err;
    }
  };

  return {
    payments,
    pendingCount,   // ← Dashboard ប្រើ badge notification
    loading,
    error,
    lastUpdated,
    fetchPayments,
    confirmPayment,
    refundPayment,
    removePayment,
  };
};

export default usePayment;