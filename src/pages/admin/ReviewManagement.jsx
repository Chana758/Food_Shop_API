import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  LuStar, LuCheck, LuX, LuTrash2, LuRefreshCw,
  LuUser, LuPackage, LuFilter, LuCircleCheckBig, LuClock,
  LuClock3, LuShieldCheck, LuShieldAlert
} from 'react-icons/lu';
import { useAdminReview } from '../../hooks/useReview';

/*
  Palette matched to the Khmer-Fresh admin (see Dashboard / Contacts /
  Delivery / Categories / Reservations): Ink #1E2A2E · Gold #D99A3D ·
  Herb #3F7D58 · Sky #3B6E91 · Plum #7A4F6D · Chili #B5453B
*/
const FONT_SERIF = { fontFamily: "'Fraunces', Georgia, serif" };
const CARD = "bg-white rounded-2xl border border-[#E8E3D8] shadow-[0_1px_3px_rgba(30,42,46,0.05)]";

// ── constants ────────────────────────────────────────────────────────
const STATUS_STYLES = {
  pending:  'bg-[#FBEDD9] text-[#8A5A12] border-[#F1D9AE] font-bold',
  approved: 'bg-[#E4F0E7] text-[#2F6844] border-[#C7E0CD] font-bold',
  rejected: 'bg-[#F5E1DE] text-[#8C3327] border-[#EBC7C1] font-bold',
};

// Bold solid fills for the 4 stat cards — Pending reads as urgent
// (chili) since it needs action; Rejected uses a darker maroon so it
// stays visually distinct from Pending even though both are "red family".
const STAT_FILL = {
  ink:   { bg: 'bg-[#1E2A2E]', sub: 'text-[#B9C2C4]' },
  chili: { bg: 'bg-[#B5453B]', sub: 'text-[#F3D4D0]' },
  herb:  { bg: 'bg-[#3F7D58]', sub: 'text-[#CFE7D7]' },
  maroon:{ bg: 'bg-[#8C3327]', sub: 'text-[#F0D3CE]' },
};

const FILTERS = ['all', 'pending', 'approved', 'rejected'];

// ── star display ─────────────────────────────────────────────────────
const Stars = ({ rating, size = 14 }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map(n => (
      <LuStar
        key={n}
        size={size}
        className={n <= rating ? 'text-[#D99A3D] fill-[#D99A3D]' : 'text-[#E3DFD3]'}
      />
    ))}
  </div>
);

// ── component ────────────────────────────────────────────────────────
const ReviewManagement = () => {
  const { searchTerm: search } = useOutletContext() ?? { searchTerm: '' };

  const [filter, setFilter]       = useState('all');
  const [actionMsg, setActionMsg] = useState(null);

  const {
    reviews, stats, loading, error,
    refetch, approveReview, rejectReview, deleteReview,
  } = useAdminReview();

  const filtered = reviews.filter(r => {
    const matchStatus = filter === 'all' || r.status === filter;
    const matchSearch = !search ||
      r.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
      r.product?.name?.toLowerCase().includes(search.toLowerCase()) ||
      r.comment?.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const showMsg = (type, text) => {
    setActionMsg({ type, text });
    setTimeout(() => setActionMsg(null), 3000);
  };

  const handleApprove = async (id) => {
    try {
      await approveReview(id);
      showMsg('success', 'Review approved!');
    } catch {
      showMsg('error', 'Failed to approve review.');
    }
  };

  const handleReject = async (id) => {
    try {
      await rejectReview(id);
      showMsg('success', 'Review rejected!');
    } catch {
      showMsg('error', 'Failed to reject review.');
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteReview(id);
      showMsg('success', 'Review deleted!');
    } catch {
      showMsg('error', 'Failed to delete review.');
    }
  };

  // Default stat values if the API hasn't provided them yet
  const totalReviews = stats?.total ?? reviews.length;
  const pendingReviews = stats?.pending ?? reviews.filter(r => r.status === 'pending').length;
  const approvedReviews = stats?.approved ?? reviews.filter(r => r.status === 'approved').length;
  const rejectedReviews = stats?.rejected ?? reviews.filter(r => r.status === 'rejected').length;

  const statCards = [
    { label: 'TOTAL REVIEWS', value: totalReviews,    fill: 'ink',    sub: 'Active tracking' },
    { label: 'PENDING',       value: pendingReviews,  fill: 'chili',  sub: 'Requires action' },
    { label: 'APPROVED',      value: approvedReviews, fill: 'herb',   sub: 'Published reviews' },
    { label: 'REJECTED',      value: rejectedReviews, fill: 'maroon', sub: 'Declined reviews' },
  ];

  return (
    <div className="mt-5 m-6 space-y-6">

      {/* Toast Notification */}
      {actionMsg && (
        <div className={`fixed top-6 right-6 z-[9999] flex items-center gap-2 px-5 py-3 rounded-xl shadow-xl text-xs font-bold
          ${actionMsg.type === 'success' ? 'bg-[#3F7D58] text-white' : 'bg-[#B5453B] text-white'}`}>
          {actionMsg.type === 'success' ? <LuCircleCheckBig size={16}/> : <LuX size={16}/>}
          {actionMsg.text}
        </div>
      )}

      {/* ── STATS CARDS — bold solid fills ── */}
      <div className={`${CARD} p-5 space-y-4`}>
        <div>
          <h2 style={FONT_SERIF} className="text-[16px] font-semibold text-[#1E2A2E]">Review performance report</h2>
          <p className="text-xs font-semibold text-[#8B9296] mt-0.5">Daily, monthly, and yearly review metrics with actionable data</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map(s => {
            const f = STAT_FILL[s.fill];
            return (
              <div key={s.label} className={`${f.bg} rounded-xl p-4 flex flex-col justify-between shadow-[0_4px_14px_rgba(30,42,46,0.12)]`}>
                <div>
                  <p className="text-[11px] font-black uppercase text-white/70 tracking-wider mb-1">{s.label}</p>
                  <p className="text-3xl font-black text-white mt-1">{s.value}</p>
                </div>
                <span className={`text-[11px] font-semibold mt-4 inline-block ${f.sub}`}>{s.sub}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filter Bar */}
      <div className={`${CARD} p-5 flex flex-wrap gap-3 items-center`}>
        <span className="text-xs font-black uppercase tracking-wider text-[#5B6B6F] flex items-center gap-1.5 mr-2">
          <LuFilter size={15} /> Filter:
        </span>
        <div className="flex gap-2 flex-wrap flex-1">
          {FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer border ${filter === f ? 'bg-[#1E2A2E] text-white border-[#1E2A2E] shadow-xs' : 'bg-[#FBF9F5] text-[#5B6B6F] border-[#E8E3D8] hover:bg-[#F3F0E9]'}`}
            >
              {f}
            </button>
          ))}
        </div>
        <button onClick={refetch} className="p-2.5 bg-[#FBF9F5] hover:bg-[#F3F0E9] border border-[#E8E3D8] rounded-lg transition-colors cursor-pointer text-[#5B6B6F] font-bold" title="Refresh">
          <LuRefreshCw size={15} />
        </button>
      </div>

      {/* List */}
      <div className={`${CARD} overflow-hidden`}>
        <div className="px-6 py-4 border-b border-[#EFEBE2] flex justify-between items-center bg-[#FBF9F5]">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#3F7D58]"></span>
            <h3 className="text-xs font-black uppercase tracking-wider text-[#1E2A2E]">All Reviews</h3>
          </div>
          <span className="text-xs bg-[#EFEBE2] text-[#1E2A2E] px-3 py-1 rounded-full font-black">
            {filtered.length} records
          </span>
        </div>

        {loading ? (
          <div className="p-16 text-center text-[#8B9296] font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2">
            <LuRefreshCw className="animate-spin" size={16} /> Loading reviews...
          </div>
        ) : error ? (
          <div className="p-16 text-center text-[#B5453B] font-bold text-sm">{error}</div>
        ) : filtered.length === 0 ? (
          <div className="p-16 text-center space-y-2">
            <LuStar size={40} className="text-[#E3DFD3] mx-auto" />
            <p className="text-[#9AA0A0] font-black text-xs uppercase tracking-wider">No reviews found</p>
          </div>
        ) : (
          <div className="divide-y divide-[#EFEBE2]">
            {filtered.map(r => (
              <div key={r.id} className="p-5 flex items-start justify-between gap-4 hover:bg-[#FBF9F5] transition-colors">
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex items-center gap-3 flex-wrap">
                    <Stars rating={r.rating} />
                    <span className={`px-3 py-0.5 rounded-full text-[11px] font-black uppercase border whitespace-nowrap ${STATUS_STYLES[r.status] ?? STATUS_STYLES.pending}`}>
                      {r.status}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-[#8B9296] flex-wrap font-semibold">
                    <span className="flex items-center gap-1.5">
                      <LuUser size={14} className="text-[#9AA0A0]" />
                      <span className="font-bold text-[#1E2A2E]">{r.user?.name || 'Guest'}</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <LuPackage size={14} className="text-[#9AA0A0]" />
                      {r.product?.name || '—'}
                    </span>
                    <span className="flex items-center gap-1.5 text-[#9AA0A0]">
                      <LuClock size={14} />
                      {new Date(r.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  {r.comment && (
                    <p className="text-xs text-[#1E2A2E] leading-relaxed bg-[#FBF9F5] border border-[#E8E3D8] rounded-xl p-3.5 font-semibold">
                      {r.comment}
                    </p>
                  )}
                </div>

                <div className="flex gap-1.5 flex-shrink-0">
                  {r.status !== 'approved' && (
                    <ActionBtn color="herb" icon={<LuCheck size={14}/>} title="Approve" onClick={() => handleApprove(r.id)} />
                  )}
                  {r.status !== 'rejected' && (
                    <ActionBtn color="chili" icon={<LuX size={14}/>} title="Reject" onClick={() => handleReject(r.id)} />
                  )}
                  <ActionBtn color="neutral" icon={<LuTrash2 size={14}/>} title="Delete" onClick={() => handleDelete(r.id)} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

const ActionBtn = ({ color, icon, title, onClick }) => {
  const colors = {
    herb:    'bg-[#E4F0E7] text-[#2F6844] hover:bg-[#D3E7D9] border-[#C7E0CD]',
    chili:   'bg-[#F5E1DE] text-[#8C3327] hover:bg-[#EFD1CC] border-[#EBC7C1]',
    neutral: 'bg-[#F1EFE9] text-[#5B6B6F] hover:bg-[#E8E3D8] border-[#E3DFD3]',
  };
  return (
    <button
      onClick={onClick}
      title={title}
      className={`p-2.5 rounded-lg border transition-colors cursor-pointer shadow-xs ${colors[color]}`}
    >
      {icon}
    </button>
  );
};

export default ReviewManagement;