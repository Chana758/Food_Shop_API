import { useState, useEffect, useCallback } from 'react';
import { contactService } from '../service/contactService';

// ======================================
// Customer / Public — ផ្ញើ contact form
// ======================================
export const useContact = () => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError]     = useState(null);

  const sendMessage = async (data) => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      await contactService.send(data);
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send message.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setSuccess(false);
    setError(null);
  };

  return { loading, success, error, sendMessage, reset };
};

// ======================================
// Admin + Staff version
// ======================================
export const useAdminContact = () => {
  const [contacts, setContacts] = useState([]);
  const [stats, setStats]       = useState(null);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState(null);

  const fetchContacts = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const [listRes, statsRes] = await Promise.all([
        contactService.getAll(params),
        contactService.getStats().catch(() => null),
      ]);

      // ✅ controller returns { status, data: <laravel paginator> }
      // and the paginator itself has its rows under .data
      const paginator = listRes?.data?.data ?? null;
      setContacts(Array.isArray(paginator?.data) ? paginator.data : (Array.isArray(paginator) ? paginator : []));

      // ✅ controller returns { status, data: {...} }
      const statsPayload = statsRes?.data?.data ?? statsRes?.data ?? null;
      setStats(statsPayload);
    } catch (err) {
      setError('Failed to load contacts.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchContacts(); }, [fetchContacts]);

  const openContact = async (id) => {
    const res = await contactService.getOne(id);
    // ✅ controller returns { status, data: <contact> }
    const contact = res?.data?.data ?? res?.data ?? null;
    setSelected(contact);
    // update list — unread → read
    setContacts(prev =>
      prev.map(c => c.id === id ? { ...c, status: 'read' } : c)
    );
    return contact;
  };

  const replyContact = async (id, data) => {
    const res = await contactService.reply(id, data);
    // ✅ controller returns { status, message, data: <contact> } — not `.contact`
    const updated = res?.data?.data ?? res?.data ?? null;
    setContacts(prev =>
      prev.map(c => c.id === id ? { ...c, status: 'replied' } : c)
    );
    setSelected(updated);
  };

  const deleteContact = async (id) => {
    await contactService.delete(id);
    setContacts(prev => prev.filter(c => c.id !== id));
    if (selected?.id === id) setSelected(null);
  };

  return {
    contacts,
    stats,
    selected,
    loading,
    error,
    refetch: fetchContacts,
    openContact,
    replyContact,
    deleteContact,
  };
};