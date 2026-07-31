import React, { useState, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  LuCalendarDays, LuCheck, LuX, LuCircleCheckBig,
  LuTrash2, LuRefreshCw, LuUser, LuTable2,
  LuUsers, LuClock, LuStickyNote, LuFilter, LuSend, LuMail,
} from 'react-icons/lu';
import { useAdminReservation } from '../../hooks/useReservation';
import { useAuth } from '../../context/AuthContext';

// constants 
const STATUS_STYLES = {
  pending:   'bg-orange-100 text-orange-800 border-orange-300 font-bold',
  confirmed: 'bg-emerald-100 text-emerald-800 border-emerald-300 font-bold',
  rejected:  'bg-rose-100 text-rose-800 border-rose-300 font-bold',
  completed: 'bg-blue-100 text-blue-800 border-blue-300 font-bold',
  cancelled: 'bg-slate-200 text-slate-700 border-slate-300 font-bold',
};

const FILTERS = ['all', 'pending', 'confirmed', 'rejected', 'completed', 'cancelled'];

// component 
const ReservationManagement = () => {
  const { user }  = useAuth();
  const isAdmin   = user?.role === 'admin';

  const { searchTerm: search } = useOutletContext() ?? { searchTerm: '' };

  const [filter,     setFilter]     = useState('all');
  const [dateFilter, setDateFilter] = useState('');
  const [selected,   setSelected]   = useState(null);
  const [noteText,   setNoteText]   = useState('');
  const [sending,    setSending]    = useState(false);
  const [actionMsg,  setActionMsg]  = useState(null);

  const [processingIds, setProcessingIds] = useState(new Set());

  const {
    reservations, stats, loading, error,
    refetch,
    confirmReservation, rejectReservation,
    completeReservation, deleteReservation,
  } = useAdminReservation();

  // filter logic 
  const filtered = reservations.filter(r => {
    const matchStatus = filter === 'all' || r.status === filter;
    const matchSearch = !search ||
      r.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
      r.user?.email?.toLowerCase().includes(search.toLowerCase()) ||
      String(r.table?.name).toLowerCase().includes(search.toLowerCase());
    const matchDate = !dateFilter ||
      new Date(r.reserved_at).toISOString().slice(0, 10) === dateFilter;
    return matchStatus && matchSearch && matchDate;
  });

  const showMsg = (type, text) => {
    setActionMsg({ type, text });
    setTimeout(() => setActionMsg(null), 3000);
  };

  const handleOpen = (r) => {
    setSelected(r);
    setNoteText('');
  };

  const handleAction = useCallback(async (action, id, message = '') => {
    setProcessingIds(prev => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      return next;
    });

    if (processingIds.has(id)) return;

    setSending(true);
    try {
      if (action === 'confirm')  await confirmReservation(id, { message });
      if (action === 'reject')   await rejectReservation(id, { message });
      if (action === 'complete') await completeReservation(id, { message });
      if (action === 'delete')   { await deleteReservation(id); setSelected(null); }

      const labels = { confirm: 'Confirmed', reject: 'Rejected', complete: 'Completed', delete: 'Deleted' };
      showMsg('success', `Reservation ${labels[action]}! ${message ? 'Email sent to customer.' : ''}`);
    } catch (err) {
      showMsg('error', err?.response?.data?.message || 'Action failed.');
    } finally {
      setSending(false);
      setProcessingIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  }, [confirmReservation, rejectReservation, completeReservation, deleteReservation, processingIds]);

  // render
  return (
    <div className="space-y-6 mt-5 m-6">

      {/* Toast Notification */}
      {actionMsg && (
        <div className={`fixed top-6 right-6 z-[9999] flex items-center gap-2 px-5 py-3 rounded-xl shadow-xl text-xs font-bold
          ${actionMsg.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-rose-500 text-white'}`}>
          {actionMsg.type === 'success' ? <LuCircleCheckBig size={16}/> : <LuX size={16}/>}
          {actionMsg.text}
        </div>
      )}

      {/* ── Stats Cards ── */}
      {stats && (
        <div className="bg-white rounded-2xl border border-slate-300 p-5 shadow-xs space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-wide">RESERVATION PERFORMANCE REPORT</h2>
              <p className="text-xs font-semibold text-slate-600">Daily, monthly, and yearly reservation metrics with actionable data</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'TOTAL RESERVATIONS', value: stats.total,     color: 'text-slate-900',   sub: 'Active tracking' },
              { label: 'PENDING',            value: stats.pending,   color: 'text-orange-700', sub: 'Requires action' },
              { label: 'CONFIRMED',          value: stats.confirmed, color: 'text-emerald-700', sub: 'Ready for arrival' },
              { label: "TODAY'S",            value: stats.today,     color: 'text-blue-700',   sub: "Today's schedule" },
            ].map(s => (
              <div key={s.label} className="bg-slate-100 rounded-xl border border-slate-300 p-4 flex flex-col justify-between">
                <div>
                  <p className="text-[11px] font-black uppercase tracking-wider text-slate-600">{s.label}</p>
                  <p className={`text-3xl font-black mt-1 ${s.color}`}>{s.value ?? 0}</p>
                </div>
                <p className="text-[11px] text-slate-600 mt-3 font-bold">{s.sub}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Quick Actions & Filters Bar ── */}
      <div className="bg-white rounded-2xl border border-slate-300 p-5 shadow-xs flex flex-wrap gap-4 items-center justify-between">
        <div className="flex items-center gap-2 flex-wrap flex-1">
          <span className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5 mr-2">
            <LuFilter size={15} /> Filter:
          </span>
          {FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer border
                ${filter === f ? 'bg-slate-900 text-white border-slate-900 shadow-xs' : 'bg-slate-100 text-slate-800 border-slate-300 hover:bg-slate-200'}`}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <input
            type="date"
            value={dateFilter}
            onChange={e => setDateFilter(e.target.value)}
            className="border border-slate-300 bg-slate-50 rounded-lg px-3.5 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
          {dateFilter && (
            <button onClick={() => setDateFilter('')} className="text-xs text-rose-600 hover:text-rose-700 font-bold">Clear</button>
          )}
          <button onClick={refetch} className="p-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg transition-colors cursor-pointer text-slate-800 font-bold" title="Refresh">
            <LuRefreshCw size={15} />
          </button>
        </div>
      </div>

      {/* ── Table Section ── */}
      <div className="bg-white rounded-2xl border border-slate-300 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-300 flex justify-between items-center bg-slate-100">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">All Reservations</h3>
          </div>
          <span className="text-xs bg-slate-300 text-slate-900 px-3 py-1 rounded-full font-black">
            {filtered.length} records
          </span>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-16 text-center text-slate-600 font-bold text-sm uppercase tracking-wider animate-pulse">
              Loading reservations...
            </div>
          ) : error ? (
            <div className="p-16 text-center text-rose-600 font-bold text-sm">{error}</div>
          ) : filtered.length === 0 ? (
            <div className="p-16 text-center space-y-2">
              <LuCalendarDays size={38} className="text-slate-400 mx-auto" />
              <p className="text-slate-600 font-black text-xs uppercase tracking-wider">No reservations found</p>
            </div>
          ) : (
            <table className="w-full min-w-[700px]">
              <thead className="bg-slate-100 border-b border-slate-300">
                <tr>
                  {['Order / #', 'Customer', 'Table', 'Guests', 'Date & Time', 'Status', 'Notes', 'Actions'].map(h => (
                    <th key={h} className="text-left px-6 py-3.5 text-[11px] font-black uppercase tracking-widest text-slate-700 whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filtered.map(r => {
                  const isProcessing = processingIds.has(r.id);
                  return (
                  <tr
                    key={r.id}
                    onClick={() => handleOpen(r)}
                    className="hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    <td className="px-6 py-4 text-xs font-black text-slate-900">#{r.id}</td>

                    {/* Customer */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-900 text-emerald-400 flex items-center justify-center text-xs font-black flex-shrink-0 shadow-xs">
                          {(r.user?.name || 'G').slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-xs font-black text-slate-900">{r.user?.name || 'Guest'}</p>
                          <p className="text-[11px] font-semibold text-slate-600">{r.user?.email || ''}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-xs text-slate-900 font-bold whitespace-nowrap">
                      {r.table?.name ?? `Table #${r.table_id ?? '—'}`}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-900 font-bold">{r.guest_count}</td>

                    {/* DateTime */}
                    <td className="px-6 py-4 text-xs text-slate-900 font-bold whitespace-nowrap">
                      {new Date(r.reserved_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      <br />
                      <span className="text-slate-600 text-xs font-semibold">
                        {new Date(r.reserved_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-[11px] font-black uppercase border whitespace-nowrap ${STATUS_STYLES[r.status] ?? STATUS_STYLES.pending}`}>
                        {r.status}
                      </span>
                    </td>

                    {/* Notes */}
                    <td className="px-6 py-4 max-w-[140px]">
                      <p className="text-xs font-semibold text-slate-700 truncate">{r.notes || '—'}</p>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4" onClick={e => e.stopPropagation()}>
                      <div className="flex gap-2">
                        {isAdmin && r.status === 'pending' && (
                          <>
                            <ActionBtn
                              color="green" icon={<LuCheck size={14}/>} title="Confirm"
                              disabled={isProcessing}
                              onClick={() => handleAction('confirm', r.id)}
                            />
                            <ActionBtn
                              color="red" icon={<LuX size={14}/>} title="Reject"
                              disabled={isProcessing}
                              onClick={() => handleAction('reject', r.id)}
                            />
                          </>
                        )}
                        {isAdmin && r.status === 'confirmed' && (
                          <ActionBtn
                            color="blue" icon={<LuCircleCheckBig size={14}/>} title="Complete"
                            disabled={isProcessing}
                            onClick={() => handleAction('complete', r.id)}
                          />
                        )}
                        {isAdmin && (
                          <ActionBtn
                            color="gray" icon={<LuTrash2 size={14}/>} title="Delete"
                            disabled={isProcessing}
                            onClick={() => handleAction('delete', r.id)}
                          />
                        )}
                      </div>
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ── Detail Modal ── */}
      {selected && (
        <div
          className="fixed inset-0 bg-slate-950/60 z-[999] flex items-center justify-center p-4 backdrop-blur-xs"
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto border border-slate-300"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex justify-between items-start mb-5">
              <div>
                <p className="text-[11px] font-black uppercase tracking-widest text-slate-600">Reservation Details</p>
                <h2 className="text-xl font-black text-slate-900">#{selected.id}</h2>
              </div>
              <button onClick={() => setSelected(null)} className="p-2 hover:bg-slate-100 rounded-lg cursor-pointer text-slate-700 hover:text-slate-900">
                <LuX size={18} />
              </button>
            </div>

            {/* Status Badge */}
            <span className={`inline-block px-3 py-1 rounded-full text-[11px] font-black uppercase border mb-5 ${STATUS_STYLES[selected.status]}`}>
              {selected.status}
            </span>

            {/* Details Box */}
            <div className="space-y-4 bg-slate-100 p-4.5 rounded-xl border border-slate-300">
              <DetailRow icon={<LuUser size={15}/>}         label="Customer" value={selected.user?.name || 'Guest'} sub={selected.user?.email} />
              <DetailRow icon={<LuTable2 size={15}/>}       label="Table"    value={selected.table?.name ?? `Table #${selected.table_id ?? '—'}`} />
              <DetailRow icon={<LuUsers size={15}/>}        label="Guests"   value={`${selected.guest_count} ${selected.guest_count === 1 ? 'Person' : 'People'}`} />
              <DetailRow icon={<LuCalendarDays size={15}/>} label="Date"     value={new Date(selected.reserved_at).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })} />
              <DetailRow icon={<LuClock size={15}/>}        label="Time"     value={new Date(selected.reserved_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} />
              {selected.notes && (
                <DetailRow icon={<LuStickyNote size={15}/>} label="Customer Notes" value={selected.notes} />
              )}
              {selected.confirmed_by && (
                <DetailRow icon={<LuUser size={15}/>} label="Actioned by" value={selected.confirmedBy?.name || `User #${selected.confirmed_by}`} />
              )}
            </div>

            {/* ── Notify Customer box ── */}
            {isAdmin && selected.status !== 'cancelled' && (
              <div className="mt-4 space-y-2">
                <label className="text-[11px] font-black uppercase tracking-widest text-slate-700 flex items-center gap-1.5">
                  <LuMail size={13} /> Message to Customer (optional, sent by email)
                </label>
                <textarea
                  rows={3}
                  value={noteText}
                  onChange={e => setNoteText(e.target.value)}
                  placeholder="e.g. Your table is by the window as requested!"
                  className="w-full border border-slate-300 rounded-xl p-3 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white resize-none"
                />
              </div>
            )}

            {/* Admin Action Buttons */}
            {isAdmin && (() => {
              const modalProcessing = processingIds.has(selected.id);
              return (
                <div className="flex gap-2.5 mt-5">
                  {selected.status === 'pending' && (
                    <>
                      <button
                        disabled={sending || modalProcessing}
                        onClick={() => { handleAction('confirm', selected.id, noteText.trim()); setSelected(null); }}
                        className="flex-1 py-3 bg-emerald-700 text-white text-xs font-black uppercase rounded-xl hover:bg-emerald-800 transition-colors disabled:opacity-40 cursor-pointer shadow-xs flex items-center justify-center gap-1.5"
                      >
                        <LuSend size={14}/> Confirm & Notify
                      </button>
                      <button
                        disabled={sending || modalProcessing}
                        onClick={() => { handleAction('reject', selected.id, noteText.trim()); setSelected(null); }}
                        className="flex-1 py-3 bg-rose-600 text-white text-xs font-black uppercase rounded-xl hover:bg-rose-700 transition-colors disabled:opacity-40 cursor-pointer shadow-xs"
                      >
                        ✕ Reject
                      </button>
                    </>
                  )}
                  {selected.status === 'confirmed' && (
                    <button
                      disabled={sending || modalProcessing}
                      onClick={() => { handleAction('complete', selected.id, noteText.trim()); setSelected(null); }}
                      className="flex-1 py-3 bg-blue-700 text-white text-xs font-black uppercase rounded-xl hover:bg-blue-800 transition-colors disabled:opacity-40 cursor-pointer shadow-xs"
                    >
                      ✔ Mark Complete
                    </button>
                  )}
                  <button
                    disabled={modalProcessing}
                    onClick={() => handleAction('delete', selected.id)}
                    className="px-4 py-3 bg-slate-200 text-slate-800 text-xs font-black uppercase rounded-xl hover:bg-rose-100 hover:text-rose-700 transition-colors disabled:opacity-40 cursor-pointer border border-slate-300"
                  >
                    <LuTrash2 size={16} />
                  </button>
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
};

// ── tiny helpers ─────────────────────────────────────────────────────
const ActionBtn = ({ color, icon, title, onClick, disabled }) => {
  const colors = {
    green: 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border-emerald-300',
    red:   'bg-rose-100   text-rose-800   hover:bg-rose-200   border-rose-300',
    blue:  'bg-blue-100  text-blue-800  hover:bg-blue-200  border-blue-300',
    gray:  'bg-slate-200  text-slate-800  hover:bg-slate-300  border-slate-300',
  };
  return (
    <button
      onClick={onClick}
      title={title}
      disabled={disabled}
      className={`p-2 rounded-lg border transition-colors cursor-pointer shadow-xs ${colors[color]} ${disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
    >
      {icon}
    </button>
  );
};

const DetailRow = ({ icon, label, value, sub }) => (
  <div className="flex items-start gap-3">
    <span className="text-slate-600 mt-0.5 flex-shrink-0">{icon}</span>
    <div>
      <p className="text-[11px] font-black uppercase tracking-widest text-slate-600">{label}</p>
      <p className="text-xs font-black text-slate-900">{value}</p>
      {sub && <p className="text-[11px] font-semibold text-slate-600">{sub}</p>}
    </div>
  </div>
);

export default ReservationManagement;