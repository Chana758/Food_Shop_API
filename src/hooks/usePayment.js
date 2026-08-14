import { useState, useEffect, useCallback, useRef } from 'react';
import axios from '../api/axios';
import useEcho from './useEcho';

const BASE_URL = '/admin/payments';
const POLL_MS  = 15_000;

const usePayment = () => {
  const [payments, setPayments]           = useState([]);
  const [pendingCount, setPendingCount]   = useState(0);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState(null);
  const [lastUpdated, setLastUpdated]     = useState(null);

  const intervalRef                       = useRef(null);
  const isFirstLoad                       = useRef(true);
  const isFetchingRef = useRef(false);

  const fetchPayments = useCallback(async (params = {}) => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;

    try {
      if (isFirstLoad.current) {
        setLoading(true);
      }
      setError(null);

      const [res, statsRes] = await Promise.all([
        axios.get(BASE_URL, { params: { per_page: 1000, ...params } }),
        axios.get(`${BASE_URL}/stats`).catch(() => null),
      ]);

      const raw = res.data?.data;
      const list = Array.isArray(raw) ? raw
                 : Array.isArray(raw?.data) ? raw.data
                 : [];

      setPayments(list);

      const realPendingCount =
        statsRes?.data?.data?.pending_confirmation_count
        ?? statsRes?.data?.data?.by_status
            ?.find(s => s.status === 'pending')?.count
        ?? list.filter(p => p.status === 'pending' && p.method !== 'cash').length;

      setPendingCount(Number(realPendingCount));
      setLastUpdated(new Date());
    } catch (err) {
      console.error('usePayment fetch error:', err.response ?? err);
      setError('Failed to load payments. Check your connection.');
    } finally {
      setLoading(false);
      isFirstLoad.current = false;
      isFetchingRef.current = false;
    }
  }, []);

  useEffect(() => {
    fetchPayments();

    intervalRef.current = setInterval(() => {
      fetchPayments();
    }, POLL_MS);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchPayments]);

  useEcho(null, {
    onAnyChange: () => {
      fetchPayments();
    },
  });

  const confirmPayment = async (id) => {
    setPayments(prev =>
      prev.map(p => p.id === id
        ? { ...p, status: 'paid', paid_at: new Date().toISOString() }
        : p
      )
    );
    setPendingCount(prev => Math.max(0, prev - 1));

    try {
      const res = await axios.put(`${BASE_URL}/${id}/confirm`);
      const updated = res.data?.data;
      if (updated) {
        setPayments(prev => prev.map(p => p.id === id ? { ...p, ...updated } : p));
      }
    } catch (err) {
      console.error('confirmPayment error:', err.response ?? err);
      fetchPayments();
      throw err;
    }
  };

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

  const removePayment = async (id) => {
    const removed = payments.find(p => p.id === id);
    setPayments(prev => prev.filter(p => p.id !== id));
    if (removed?.status === 'pending' && removed?.method !== 'cash') {
      setPendingCount(prev => Math.max(0, prev - 1));
    }

    try {
      await axios.delete(`${BASE_URL}/${id}`);
    } catch (err) {
      console.error('removePayment error:', err.response ?? err);
      if (removed) setPayments(prev => [removed, ...prev]);
      throw err;
    }
  };

  return {
    payments,
    pendingCount,
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