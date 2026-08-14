import { useState, useEffect, useCallback, useRef } from 'react';
import orderService from '../service/orderService';
import useEcho from './useEcho';

const STATUS_FLOW = ['pending', 'cooking', 'served'];

const useOrder = () => {
  const [orders, setOrders]         = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);


  const isFetchingRef = useRef(false);

  const fetchOrders = useCallback(async (params = {}) => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;

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
      isFetchingRef.current = false;
    }
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  useEcho(null, {
    onAnyChange: () => {
      fetchOrders();
    },
  });

  const advanceStatus = async (id) => {
    const order = orders.find(o => o.id === id);
    if (!order) return;

    const nextIndex  = STATUS_FLOW.indexOf(order.status) + 1;
    const nextStatus = STATUS_FLOW[nextIndex];
    if (!nextStatus) return;

    setOrders(prev => prev.map(o => o.id === id ? { ...o, status: nextStatus } : o));

    try {
      await orderService.update(id, { status: nextStatus });
    } catch (err) {
      console.error('Failed to advance status:', err.response ?? err);
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status: order.status } : o));
    }
  };

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