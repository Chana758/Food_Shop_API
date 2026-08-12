import { useState, useEffect, useCallback } from 'react';
import orderService from '../service/orderService';
import useEcho from './useEcho';

/**
 * FIX: This used to be ['pending', 'cooking', 'served', 'paid'] here,
 * while ManageOrders.jsx defined its OWN separate copy as just
 * ['pending', 'cooking', 'served'] (no 'paid'). Two different arrays
 * with the same name in two files is a drift hazard — and 'paid' was
 * dead weight here anyway, since the UI never lets an order advance
 * past 'served' (payment is a separate flow via PaymentController, not
 * something the kitchen "advances" into). Kept in sync with the
 * ADMIN_UPDATABLE_STATUSES kitchen workflow on the backend
 * (OrderController::update): pending → cooking → served.
 */
const STATUS_FLOW = ['pending', 'cooking', 'served'];

const useOrder = () => {
  const [orders, setOrders]         = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);

  // ── Fetch all orders (admin) ──────────────────────────────────────────────
  const fetchOrders = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      setError(null);

      const res = await orderService.getAll(params);

      if (Array.isArray(res)) {
        setOrders(res);
      } else if (res?.data) {
        setOrders(res.data);
        setPagination({
          currentPage: res.current_page,
          lastPage:    res.last_page,
          total:       res.total,
          perPage:     res.per_page,
        });
      } else {
        setOrders([]);
      }

    } catch (err) {
      console.error('Failed to fetch orders:', err.response ?? err);
      setError('Failed to load orders. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  // FIX: previously this hook never subscribed to real-time updates at
  // all, even though the backend already broadcasts OrderStatusChanged /
  // OrderPaid on the shared 'orders' channel (new orders via
  // OrderController::store(), status changes, rider assignment, KHQR
  // payment confirmation). Without this, the Order Management screen
  // silently went stale until an admin manually clicked "Refresh" —
  // wasting infrastructure that was already built and working elsewhere
  // (e.g. the dashboard). Passing orderId = null puts this in
  // "broadcast-wide" mode: any event on the channel triggers a refetch.
  useEcho(null, {
    onAnyChange: () => {
      fetchOrders();
    },
  });

  // ── Advance order status: pending → cooking → served ─────────────────────
  const advanceStatus = async (id) => {
    const order = orders.find(o => o.id === id);
    if (!order) return;

    const nextIndex  = STATUS_FLOW.indexOf(order.status) + 1;
    const nextStatus = STATUS_FLOW[nextIndex];
    if (!nextStatus) return;

    // Optimistic UI update
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status: nextStatus } : o));

    try {
      await orderService.update(id, { status: nextStatus });
    } catch (err) {
      console.error('Failed to advance status:', err.response ?? err);
      // Revert on failure
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status: order.status } : o));
    }
  };

  // ── Delete order (admin) ─────────────────────────────────────────────────
  const removeOrder = async (id) => {
    try {
      await orderService.remove(id);
      setOrders(prev => prev.filter(o => o.id !== id));
    } catch (err) {
      console.error('Failed to delete order:', err.response ?? err);
      throw err;
    }
  };

  return {
    orders,
    pagination,
    loading,
    error,
    fetchOrders,
    advanceStatus,
    removeOrder,
  };
};

export default useOrder;