import React, { useEffect, useState } from "react";
import { useTranslation } from 'react-i18next';
import { FaCalendarCheck, FaUserFriends, FaClock, FaArrowRight, FaTable } from "react-icons/fa";
import { BiLeaf } from "react-icons/bi";
import { LuSquareCheckBig, LuCircleAlert } from "react-icons/lu";
import AOS from "aos";
import "aos/dist/aos.css";
import { useReservation } from "../../hooks/useReservation";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";

const Reservation = () => {
  const { t }      = useTranslation();
  const { user }   = useAuth();
  const navigate   = useNavigate();
  const { createReservation } = useReservation();

  const [tables,  setTables]  = useState([]);
  const [form,    setForm]    = useState({
    table_id:    '',
    guest_count: '1',
    date:        '',
    time:        '',
    notes:       '',
  });
  const [loading,  setLoading]  = useState(false);
  const [toast,    setToast]    = useState(null); // { type: 'success'|'error', message }

  // Load tables once on mount
  useEffect(() => {
    api.get('/tables')
      .then(res => {
        console.log('API /tables raw response:', res); // TEMP DEBUG — remove after fixing
        const payload = res.data;
        const list = Array.isArray(payload)
          ? payload
          : Array.isArray(payload?.data)
            ? payload.data
            : Array.isArray(payload?.tables)
              ? payload.tables
              : [];
        console.log('Parsed tables list:', list); // TEMP DEBUG — remove after fixing
        setTables(list);
      })
      .catch(err => {
        console.error('Failed to load /tables:', err); // TEMP DEBUG — remove after fixing
        setTables([]);
      });
  }, []);

  useEffect(() => {
    AOS.init({ duration: 1000, easing: "ease-in-out", once: true });
  }, []);

  // Auto-dismiss toast after 4 s
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  const handleChange = (e) =>
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async () => {
    if (!user) { navigate('/login'); return; }

    if (!form.table_id) {
      setToast({ type: 'error', message: 'Please select a table.' });
      return;
    }
    if (!form.date) {
      setToast({ type: 'error', message: 'Please select a date.' });
      return;
    }
    if (!form.time) {
      setToast({ type: 'error', message: 'Please select a time (make sure AM/PM is set).' });
      return;
    }
    if (!form.guest_count) {
      setToast({ type: 'error', message: 'Please select number of guests.' });
      return;
    }

    const reserved_at = `${form.date}T${form.time}:00`;

    setLoading(true);
    try {
      await createReservation({
        table_id:    Number(form.table_id),
        guest_count: Number(form.guest_count),
        reserved_at,
        notes: form.notes || null,
      });
      setToast({ type: 'success', message: 'Reservation submitted! We will confirm your booking shortly.' });
      setForm({ table_id: '', guest_count: '1', date: '', time: '', notes: '' });
    } catch (err) {
      setToast({ type: 'error', message: err?.response?.data?.message || 'Failed to submit reservation.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#FDFDFD] pt-32 pb-20 px-6">

      {/* ── Toast ── */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-xl shadow-xl text-sm font-bold transition-all
          ${toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-500 text-white'}`}>
          {toast.type === 'success'
            ? <LuSquareCheckBig size={18} />
            : <LuCircleAlert  size={18} />}
          {toast.message}
        </div>
      )}

      <div className="max-w-5xl mx-auto">

        {/* ── Header ── */}
        <div data-aos="fade-down" className="mb-20 border-l-8 border-[#2D4A22] pl-6 relative">
          <h1 className="text-4xl md:text-5xl font-black text-[#2D4A22] uppercase tracking-tighter">
            {t('reservation.title', 'Make A Reservation')}{' '}
            <span className="text-[#F58220]">Book Table</span>
          </h1>
          <p className="text-gray-500 font-medium mt-2 uppercase text-xs tracking-[0.3em]">
            {t('reservation.subtitle', 'Book your table in advance and enjoy a wonderful dining experience.')}
          </p>
          <BiLeaf className="absolute -top-10 right-0 text-[#2D4A22]/5" size={200} />
        </div>

        {/* ── Form Card ── */}
        <div className="bg-white border border-gray-100 p-8 md:p-16 shadow-[0_20px_50px_rgba(0,0,0,0.02)] relative overflow-hidden">
          <div className="absolute top-10 right-[-5%] text-[150px] font-black text-gray-50 select-none pointer-events-none italic opacity-40">
            FRESH
          </div>

          <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">

            {/* Table Select */}
            <div className="space-y-3 group md:col-span-2" data-aos="fade-up">
              <label className="text-[10px] font-black uppercase tracking-[0.3em] text-[#2D4A22] flex items-center gap-2">
                <FaTable className="text-[#F58220]" size={13} /> Select Table *
              </label>
              <select
                name="table_id"
                value={form.table_id}
                onChange={handleChange}
                className="w-full bg-transparent border-b-2 border-gray-100 py-3 focus:border-[#2D4A22] outline-none transition-all font-medium text-gray-800 cursor-pointer appearance-none"
              >
                <option value="">— Choose a table —</option>
                {tables.map(tbl => (
                  <option key={tbl.id} value={tbl.id}>
                    Table {tbl.number}
                    {tbl.capacity ? ` — Seats up to ${tbl.capacity}` : ''}
                    {tbl.location ? ` (${tbl.location})` : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Date */}
            <div className="space-y-3 group" data-aos="fade-up" data-aos-delay="100">
              <label className="text-[10px] font-black uppercase tracking-[0.3em] text-[#2D4A22] flex items-center gap-2">
                <FaCalendarCheck className="text-[#F58220]" size={13} />
                {t('reservation.date', 'Date')} *
              </label>
              <input
                type="date"
                name="date"
                value={form.date}
                onChange={handleChange}
                min={new Date().toISOString().split('T')[0]}
                className="w-full bg-transparent border-b-2 border-gray-100 py-3 focus:border-[#2D4A22] outline-none transition-all font-medium text-gray-800"
              />
              <p className="text-[10px] text-gray-400 font-medium">
                {form.date ? `Selected: ${new Date(form.date + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'long', day: 'numeric' })}` : ''}
              </p>
            </div>

            {/* Time */}
            <div className="space-y-3 group" data-aos="fade-up" data-aos-delay="200">
              <label className="text-[10px] font-black uppercase tracking-[0.3em] text-[#2D4A22] flex items-center gap-2">
                <FaClock className="text-[#F58220]" size={13} />
                {t('reservation.time', 'Time')} *
              </label>
              <input
                type="time"
                name="time"
                value={form.time}
                onChange={handleChange}
                min="07:00"
                max="21:30"
                className="w-full bg-transparent border-b-2 border-gray-100 py-3 focus:border-[#2D4A22] outline-none transition-all font-medium text-gray-800"
              />
            </div>

            {/* Guests */}
            <div className="space-y-3 group md:col-span-2" data-aos="fade-up" data-aos-delay="300">
              <label className="text-[10px] font-black uppercase tracking-[0.3em] text-[#2D4A22] flex items-center gap-2">
                <FaUserFriends className="text-[#F58220]" size={14} />
                {t('reservation.guests', 'Number of Guests')} *
              </label>
              <select
                name="guest_count"
                value={form.guest_count}
                onChange={handleChange}
                className="w-full bg-transparent border-b-2 border-gray-100 py-3 focus:border-[#2D4A22] outline-none transition-all font-medium text-gray-800 cursor-pointer appearance-none"
              >
                {Array.from({ length: 10 }, (_, i) => i + 1).map(n => (
                  <option key={n} value={n}>{n} {n === 1 ? 'Person' : 'People'}</option>
                ))}
              </select>
            </div>

            {/* Notes */}
            <div className="space-y-3 md:col-span-2" data-aos="fade-up" data-aos-delay="400">
              <label className="text-[10px] font-black uppercase tracking-[0.3em] text-[#2D4A22]">
                {t('reservation.message', 'Message')} (Optional)
              </label>
              <textarea
                name="notes"
                value={form.notes}
                onChange={handleChange}
                rows="2"
                placeholder={t('reservation.specialRequests', 'Any special requests?')}
                className="w-full bg-transparent border-b-2 border-gray-100 py-3 focus:border-[#2D4A22] outline-none transition-all font-medium text-gray-800 resize-none placeholder:font-light"
              />
            </div>

            {/* Submit */}
            <div className="md:col-span-2 pt-10" data-aos="zoom-in">
              {!user && (
                <p className="text-sm text-orange-500 font-bold mb-5">
                  ⚠️ You must be logged in to reserve a table.{' '}
                  <button onClick={() => navigate('/login')} className="underline hover:text-[#2D4A22] transition-colors">
                    Login here
                  </button>
                </p>
              )}
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="group flex items-center justify-center gap-4 w-full md:w-max px-16 py-5 bg-[#2D4A22] text-white font-black text-xs uppercase tracking-[0.4em] hover:bg-[#F58220] transition-all duration-500 shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Submitting...' : t('reservation.reserveNow', 'Reserve Now')}
                {!loading && (
                  <FaArrowRight className="group-hover:translate-x-2 transition-transform duration-300" />
                )}
              </button>
            </div>

          </div>
        </div>

        {/* ── Footer Info ── */}
        <div className="mt-16 grid md:grid-cols-3 gap-8 border-t border-gray-100 pt-10">
          {[
            { label: 'Direct Line',    value: '+855 972325094' },
            { label: 'Location',       value: 'Phnom Penh, Cambodia' },
            { label: 'Service Hours',  value: '07:00 AM - 10:00 PM' },
          ].map(item => (
            <div key={item.label} className="text-center md:text-left">
              <p className="text-[#2D4A22] font-black text-[10px] uppercase tracking-widest mb-1">{item.label}</p>
              <p className="text-gray-500 font-bold">{item.value}</p>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default Reservation;