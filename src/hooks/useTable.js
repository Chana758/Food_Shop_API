import { useState, useEffect } from 'react';
import tableService from '../service/tableService';

const useTable = () => {
  const [tables, setTables]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => { fetchTables(); }, []);

  const fetchTables = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await tableService.getAll();
      setTables(data);
    } catch {
      setError('មិនអាច load tables បាន');
    } finally {
      setLoading(false);
    }
  };

  const addTable = async (payload) => {
    const newTable = await tableService.create(payload);
    setTables(prev => [...prev, newTable]);
  };

  const editTable = async (id, payload) => {
    const updated = await tableService.update(id, payload);
    setTables(prev => prev.map(t => t.id === id ? updated : t));
  };

  const cycleStatus = async (id) => {
    const order = ['available', 'occupied', 'reserved'];
    const table = tables.find(t => t.id === id);
    const nextStatus = order[(order.indexOf(table.status) + 1) % order.length];
    // Optimistic update
    setTables(prev => prev.map(t => t.id === id ? { ...t, status: nextStatus } : t));
    try {
      await tableService.update(id, { status: nextStatus });
    } catch {
      // Revert បើ fail
      setTables(prev => prev.map(t => t.id === id ? { ...t, status: table.status } : t));
    }
  };

  const removeTable = async (id) => {
    await tableService.remove(id);
    setTables(prev => prev.filter(t => t.id !== id));
  };

  return { tables, loading, error, fetchTables, addTable, editTable, cycleStatus, removeTable };
};

export default useTable;