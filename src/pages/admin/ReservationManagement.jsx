import React, { useState, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  LuCalendarDays, LuCheck, LuX, LuCircleCheckBig,
  LuTrash2, LuRefreshCw, LuUser, LuTable2,
  LuUsers, LuClock, LuStickyNote, LuFilter, LuSend, LuMail,
} from 'react-icons/lu';
import { useAdminReservation } from '../../hooks/useReservation';
import { useAuth } from '../../context/AuthContext';

/*
  Palette matched to the Khmer-Fresh admin (see Dashboard / Contacts /
  Delivery / Categories): Ink #1E2A2E · Gold #D99A3D · Herb #3F7D58 ·
  Sky #3B6E91 · Plum #7A4F6D · Chili #B5453B
*/
const FONT_SERIF = { fontFamily: "'Fraunces', Georgia, serif" };
const CARD = "bg-white rounded-2xl border border-[#E8E3D8] shadow-[0_1px_3px_rgba(30,42,46,0.05)]";

// constants
const STATUS_STYLES = {
  pending:   'bg-[#FBEDD9] text-[#8A5A12] border-[#F1D9AE] font-bold',
  confirmed: 'bg-[#E4F0E7] text-[#2F6844] border-[#C7E0CD] font-bold',
  rejected:  'bg-[#F5E1DE] text-[#8C3327] border-[#EBC7C1] font-bold',
  completed: 'bg-[#E3EDF3] text-[#2E5975] border-[#C9DCE8] font-bold',
  cancelled: 'bg-[#F1EFE9] text-[#6B6259] border-[#E3DFD3] font-bold',
};

// Bold solid fills for the 4 stat cards — same treatment as the other
// admin pages. Pending reads as urgent (chili) since it needs action.
const STAT_FILL = {
  ink:   { bg: 'bg-[#1E2A2E]', sub: 'text-[#B9C2C4]' },
  chili: { bg: 'bg-[#B5453B]', sub: 'text-[#F3D4D0]' },
  herb:  { bg: 'bg-[#3F7D58]', sub: 'text-[#CFE7D7]' },
  sky:   { bg: 'bg-[#3B6E91]', sub: 'text-[#CFE1EC]' },
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
          ${actionMsg.type === 'success' ? 'bg-[#3F7D58] text-white' : 'bg-[#B5453B] text-white'}`}>
          {actionMsg.type === 'success' ? <LuCircleCheckBig size={16}/> : <LuX size={16}/>}
          {actionMsg.text}
        </div>
      )}

      {/* ── Stats Cards — bold solid fills ── */}
      {stats && (
        <div className={`${CARD} p-5 space-y-4`}>
          <div className="flex justify-between items-center">
            <div>
              <h2 style={FONT_SERIF} className="text-[16px] font-semibold text-[#1E2A2E]">Reservation performance report</h2>
              <p className="text-xs font-semibold text-[#8B9296]">Daily, monthly, and yearly reservation metrics with actionable data</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'TOTAL RESERVATIONS', value: stats.total,     fill: 'ink',   sub: 'Active tracking' },
              { label: 'PENDING',            value: stats.pending,   fill: 'chili', sub: 'Requires action' },
              { label: 'CONFIRMED',          value: stats.confirmed, fill: 'herb',  sub: 'Ready for arrival' },
              { label: "TODAY'S",            value: stats.today,     fill: 'sky',   sub: "Today's schedule" },
            ].map(s => {
              const f = STAT_FILL[s.fill];
              return (
                <div key={s.label} className={`${f.bg} rounded-xl p-4 flex flex-col justify-between shadow-[0_4px_14px_rgba(30,42,46,0.12)]`}>
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-wider text-white/70">{s.label}</p>
                    <p className="text-3xl font-black mt-1 text-white">{s.value ?? 0}</p>
                  </div>
                  <p className={`text-[11px] mt-3 font-bold ${f.sub}`}>{s.sub}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Quick Actions & Filters Bar ── */}
      <div className={`${CARD} p-5 flex flex-wrap gap-4 items-center justify-between`}>
        <div className="flex items-center gap-2 flex-wrap flex-1">
          <span className="text-xs font-black uppercase tracking-wider text-[#5B6B6F] flex items-center gap-1.5 mr-2">
            <LuFilter size={15} /> Filter:
          </span>
          {FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer border
                ${filter === f ? 'bg-[#1E2A2E] text-white border-[#1E2A2E] shadow-xs' : 'bg-[#FBF9F5] text-[#5B6B6F] border-[#E8E3D8] hover:bg-[#F3F0E9]'}`}
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
            className="border border-[#E8E3D8] bg-[#FBF9F5] rounded-lg px-3.5 py-2 text-xs font-bold text-[#1E2A2E] focus:outline-none focus:ring-2 focus:ring-[#1E2A2E]/15"
          />
          {dateFilter && (
            <button onClick={() => setDateFilter('')} className="text-xs text-[#B5453B] hover:text-[#9C3B32] font-bold">Clear</button>
          )}
          <button onClick={refetch} className="p-2.5 bg-[#FBF9F5] hover:bg-[#F3F0E9] border border-[#E8E3D8] rounded-lg transition-colors cursor-pointer text-[#5B6B6F] font-bold" title="Refresh">
            <LuRefreshCw size={15} />
          </button>
        </div>
      </div>

      {/* ── Table Section ── */}
      <div className={`${CARD} overflow-hidden`}>
        <div className="px-6 py-4 border-b border-[#EFEBE2] flex justify-between items-center bg-[#FBF9F5]">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#3F7D58]"></span>
            <h3 className="text-xs font-black uppercase tracking-wider text-[#1E2A2E]">All Reservations</h3>
          </div>
          <span className="text-xs bg-[#EFEBE2] text-[#1E2A2E] px-3 py-1 rounded-full font-black">
            {filtered.length} records
          </span>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-16 text-center text-[#8B9296] font-bold text-sm uppercase tracking-wider animate-pulse">
              Loading reservations...
            </div>
          ) : error ? (
            <div className="p-16 text-center text-[#B5453B] font-bold text-sm">{error}</div>
          ) : filtered.length === 0 ? (
            <div className="p-16 text-center space-y-2">
              <LuCalendarDays size={38} className="text-[#E3DFD3] mx-auto" />
              <p className="text-[#9AA0A0] font-black text-xs uppercase tracking-wider">No reservations found</p>
            </div>
          ) : (
            <table className="w-full min-w-[700px]">
              <thead className="bg-[#FBF9F5] border-b border-[#EFEBE2]">
                <tr>
                  {['Order / #', 'Customer', 'Table', 'Guests', 'Date & Time', 'Status', 'Notes', 'Actions'].map(h => (
                    <th key={h} className="text-left px-6 py-3.5 text-[11px] font-black uppercase tracking-widest text-[#8B9296] whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EFEBE2]">
                {filtered.map(r => {
                  const isProcessing = processingIds.has(r.id);
                  return (
                  <tr
                    key={r.id}
                    onClick={() => handleOpen(r)}
                    className="hover:bg-[#FBF9F5] cursor-pointer transition-colors"
                  >
                    <td className="px-6 py-4 text-xs font-black text-[#1E2A2E]">#{r.id}</td>

                    {/* Customer */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[#1E2A2E] text-[#E8C97A] flex items-center justify-center text-xs font-black flex-shrink-0 shadow-xs">
                          {(r.user?.name || 'G').slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-xs font-black text-[#1E2A2E]">{r.user?.name || 'Guest'}</p>
                          <p className="text-[11px] font-semibold text-[#8B9296]">{r.user?.email || ''}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-xs text-[#1E2A2E] font-bold whitespace-nowrap">
                      {r.table?.name ?? `Table #${r.table_id ?? '—'}`}
                    </td>
                    <td className="px-6 py-4 text-xs text-[#1E2A2E] font-bold">{r.guest_count}</td>

                    {/* DateTime */}
                    <td className="px-6 py-4 text-xs text-[#1E2A2E] font-bold whitespace-nowrap">
                      {new Date(r.reserved_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      <br />
                      <span className="text-[#8B9296] text-xs font-semibold">
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
                      <p className="text-xs font-semibold text-[#5B6B6F] truncate">{r.notes || '—'}</p>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4" onClick={e => e.stopPropagation()}>
                      <div className="flex gap-2">
                        {isAdmin && r.status === 'pending' && (
                          <>
                            <ActionBtn
                              color="herb" icon={<LuCheck size={14}/>} title="Confirm"
                              disabled={isProcessing}
                              onClick={() => handleAction('confirm', r.id)}
                            />
                            <ActionBtn
                              color="chili" icon={<LuX size={14}/>} title="Reject"
                              disabled={isProcessing}
                              onClick={() => handleAction('reject', r.id)}
                            />
                          </>
                        )}
                        {isAdmin && r.status === 'confirmed' && (
                          <ActionBtn
                            color="sky" icon={<LuCircleCheckBig size={14}/>} title="Complete"
                            disabled={isProcessing}
                            onClick={() => handleAction('complete', r.id)}
                          />
                        )}
                        {isAdmin && (
                          <ActionBtn
                            color="neutral" icon={<LuTrash2 size={14}/>} title="Delete"
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
          className="fixed inset-0 bg-[#1E2A2E]/60 z-[999] flex items-center justify-center p-4 backdrop-blur-xs"
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto border border-[#E8E3D8]"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex justify-between items-start mb-5">
              <div>
                <p className="text-[11px] font-black uppercase tracking-widest text-[#8B9296]">Reservation Details</p>
                <h2 className="text-xl font-black text-[#1E2A2E]">#{selected.id}</h2>
              </div>
              <button onClick={() => setSelected(null)} className="p-2 hover:bg-[#FBF9F5] rounded-lg cursor-pointer text-[#5B6B6F] hover:text-[#1E2A2E]">
                <LuX size={18} />
              </button>
            </div>

            {/* Status Badge */}
            <span className={`inline-block px-3 py-1 rounded-full text-[11px] font-black uppercase border mb-5 ${STATUS_STYLES[selected.status]}`}>
              {selected.status}
            </span>

            {/* Details Box */}
            <div className="space-y-4 bg-[#FBF9F5] p-4.5 rounded-xl border border-[#E8E3D8]">
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
                <label className="text-[11px] font-black uppercase tracking-widest text-[#5B6B6F] flex items-center gap-1.5">
                  <LuMail size={13} /> Message to Customer (optional, sent by email)
                </label>
                <textarea
                  rows={3}
                  value={noteText}
                  onChange={e => setNoteText(e.target.value)}
                  placeholder="e.g. Your table is by the window as requested!"
                  className="w-full border border-[#E8E3D8] rounded-xl p-3 text-xs font-semibold text-[#1E2A2E] focus:outline-none focus:ring-2 focus:ring-[#3B6E91]/20 bg-white resize-none"
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
                        className="flex-1 py-3 bg-[#3F7D58] text-white text-xs font-black uppercase rounded-xl hover:bg-[#35674A] transition-colors disabled:opacity-40 cursor-pointer shadow-xs flex items-center justify-center gap-1.5"
                      >
                        <LuSend size={14}/> Confirm & Notify
                      </button>
                      <button
                        disabled={sending || modalProcessing}
                        onClick={() => { handleAction('reject', selected.id, noteText.trim()); setSelected(null); }}
                        className="flex-1 py-3 bg-[#B5453B] text-white text-xs font-black uppercase rounded-xl hover:bg-[#9C3B32] transition-colors disabled:opacity-40 cursor-pointer shadow-xs"
                      >
                        ✕ Reject
                      </button>
                    </>
                  )}
                  {selected.status === 'confirmed' && (
                    <button
                      disabled={sending || modalProcessing}
                      onClick={() => { handleAction('complete', selected.id, noteText.trim()); setSelected(null); }}
                      className="flex-1 py-3 bg-[#3B6E91] text-white text-xs font-black uppercase rounded-xl hover:bg-[#325F7D] transition-colors disabled:opacity-40 cursor-pointer shadow-xs"
                    >
                      ✔ Mark Complete
                    </button>
                  )}
                  <button
                    disabled={modalProcessing}
                    onClick={() => handleAction('delete', selected.id)}
                    className="px-4 py-3 bg-[#F1EFE9] text-[#5B6B6F] text-xs font-black uppercase rounded-xl hover:bg-[#F5E1DE] hover:text-[#B5453B] transition-colors disabled:opacity-40 cursor-pointer border border-[#E3DFD3]"
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
    herb:    'bg-[#E4F0E7] text-[#2F6844] hover:bg-[#D3E7D9] border-[#C7E0CD]',
    chili:   'bg-[#F5E1DE] text-[#8C3327] hover:bg-[#EFD1CC] border-[#EBC7C1]',
    sky:     'bg-[#E3EDF3] text-[#2E5975] hover:bg-[#D5E3EC] border-[#C9DCE8]',
    neutral: 'bg-[#F1EFE9] text-[#5B6B6F] hover:bg-[#E8E3D8] border-[#E3DFD3]',
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
    <span className="text-[#8B9296] mt-0.5 flex-shrink-0">{icon}</span>
    <div>
      <p className="text-[11px] font-black uppercase tracking-widest text-[#8B9296]">{label}</p>
      <p className="text-xs font-black text-[#1E2A2E]">{value}</p>
      {sub && <p className="text-[11px] font-semibold text-[#8B9296]">{sub}</p>}
    </div>
  </div>
);

export default ReservationManagement;