import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  LuStar, LuCheck, LuX, LuTrash2, LuRefreshCw,
  LuUser, LuPackage, LuFilter, LuCircleCheckBig, LuClock,
  LuClock3, LuShieldCheck, LuShieldAlert
} from 'react-icons/lu';
import { useAdminReview } from '../../hooks/useReview';

// ── constants ────────────────────────────────────────────────────────
const STATUS_STYLES = {
  pending:  'bg-orange-100 text-orange-800 border-orange-300 font-bold',
  approved: 'bg-emerald-100 text-emerald-800 border-emerald-300 font-bold',
  rejected: 'bg-rose-100 text-rose-800 border-rose-300 font-bold',
};

const FILTERS = ['all', 'pending', 'approved', 'rejected'];

// ── star display ─────────────────────────────────────────────────────
const Stars = ({ rating, size = 14 }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map(n => (
      <LuStar
        key={n}
        size={size}
        className={n <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-300'}
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

  // ຄຳណວນតម្លៃ Stats ទុកជា Default ប្រសិនបើ API មិនទាន់ផ្ដល់មក
  const totalReviews = stats?.total ?? reviews.length;
  const pendingReviews = stats?.pending ?? reviews.filter(r => r.status === 'pending').length;
  const approvedReviews = stats?.approved ?? reviews.filter(r => r.status === 'approved').length;
  const rejectedReviews = stats?.rejected ?? reviews.filter(r => r.status === 'rejected').length;

  return (
    <div className="mt-5 m-6 space-y-6">

      {/* Toast Notification */}
      {actionMsg && (
        <div className={`fixed top-6 right-6 z-[9999] flex items-center gap-2 px-5 py-3 rounded-xl shadow-xl text-xs font-bold
          ${actionMsg.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-rose-500 text-white'}`}>
          {actionMsg.type === 'success' ? <LuCircleCheckBig size={16}/> : <LuX size={16}/>}
          {actionMsg.text}
        </div>
      )}

      {/* ── STATS CARDS ── */}
      <div className="bg-white rounded-2xl border border-slate-300 p-5 shadow-xs space-y-4">
        <div>
          <h2 className="text-sm font-black text-slate-900 uppercase tracking-wide">REVIEW PERFORMANCE REPORT</h2>
          <p className="text-xs font-semibold text-slate-500 mt-0.5">Daily, monthly, and yearly review metrics with actionable data</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div className="bg-slate-50/70 rounded-xl border border-slate-200 p-4 relative overflow-hidden flex flex-col justify-between">
            <div>
              <p className="text-[11px] font-black uppercase text-slate-700 tracking-wider mb-1">TOTAL REVIEWS</p>
              <p className="text-3xl font-black text-slate-900 mt-1">{totalReviews}</p>
            </div>
            <span className="text-[11px] text-slate-500 font-semibold mt-4 inline-block">Active tracking</span>
          </div>

          <div className="bg-slate-50/70 rounded-xl border border-slate-200 p-4 relative overflow-hidden flex flex-col justify-between">
            <div>
              <p className="text-[11px] font-black uppercase text-slate-700 tracking-wider mb-1">PENDING</p>
              <p className="text-3xl font-black text-orange-600 mt-1">{pendingReviews}</p>
            </div>
            <span className="text-[11px] text-slate-500 font-semibold mt-4 inline-block">Requires action</span>
          </div>

          <div className="bg-slate-50/70 rounded-xl border border-slate-200 p-4 relative overflow-hidden flex flex-col justify-between">
            <div>
              <p className="text-[11px] font-black uppercase text-slate-700 tracking-wider mb-1">APPROVED</p>
              <p className="text-3xl font-black text-emerald-600 mt-1">{approvedReviews}</p>
            </div>
            <span className="text-[11px] text-slate-500 font-semibold mt-4 inline-block">Published reviews</span>
          </div>

          <div className="bg-slate-50/70 rounded-xl border border-slate-200 p-4 relative overflow-hidden flex flex-col justify-between">
            <div>
              <p className="text-[11px] font-black uppercase text-slate-700 tracking-wider mb-1">REJECTED</p>
              <p className="text-3xl font-black text-rose-600 mt-1">{rejectedReviews}</p>
            </div>
            <span className="text-[11px] text-slate-500 font-semibold mt-4 inline-block">Declined reviews</span>
          </div>

        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-300 p-5 flex flex-wrap gap-3 items-center shadow-xs">
        <span className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5 mr-2">
          <LuFilter size={15} /> Filter:
        </span>
        <div className="flex gap-2 flex-wrap flex-1">
          {FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer border ${filter === f ? 'bg-slate-900 text-white border-slate-900 shadow-xs' : 'bg-slate-100 text-slate-800 border-slate-300 hover:bg-slate-200'}`}
            >
              {f}
            </button>
          ))}
        </div>
        <button onClick={refetch} className="p-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg transition-colors cursor-pointer text-slate-800 font-bold" title="Refresh">
          <LuRefreshCw size={15} />
        </button>
      </div>

      {/* List */}
      <div className="bg-white rounded-2xl border border-slate-300 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-300 flex justify-between items-center bg-slate-100">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">All Reviews</h3>
          </div>
          <span className="text-xs bg-slate-300 text-slate-900 px-3 py-1 rounded-full font-black">
            {filtered.length} records
          </span>
        </div>

        {loading ? (
          <div className="p-16 text-center text-slate-600 font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2">
            <LuRefreshCw className="animate-spin" size={16} /> Loading reviews...
          </div>
        ) : error ? (
          <div className="p-16 text-center text-rose-600 font-bold text-sm">{error}</div>
        ) : filtered.length === 0 ? (
          <div className="p-16 text-center space-y-2">
            <LuStar size={40} className="text-slate-400 mx-auto" />
            <p className="text-slate-600 font-black text-xs uppercase tracking-wider">No reviews found</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-200">
            {filtered.map(r => (
              <div key={r.id} className="p-5 flex items-start justify-between gap-4 hover:bg-slate-50 transition-colors">
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex items-center gap-3 flex-wrap">
                    <Stars rating={r.rating} />
                    <span className={`px-3 py-0.5 rounded-full text-[11px] font-black uppercase border whitespace-nowrap ${STATUS_STYLES[r.status] ?? STATUS_STYLES.pending}`}>
                      {r.status}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-slate-600 flex-wrap font-semibold">
                    <span className="flex items-center gap-1.5">
                      <LuUser size={14} className="text-slate-500" />
                      <span className="font-bold text-slate-900">{r.user?.name || 'Guest'}</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <LuPackage size={14} className="text-slate-500" />
                      {r.product?.name || '—'}
                    </span>
                    <span className="flex items-center gap-1.5 text-slate-500">
                      <LuClock size={14} />
                      {new Date(r.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  {r.comment && (
                    <p className="text-xs text-slate-900 leading-relaxed bg-slate-100 border border-slate-300 rounded-xl p-3.5 font-semibold">
                      {r.comment}
                    </p>
                  )}
                </div>

                <div className="flex gap-1.5 flex-shrink-0">
                  {r.status !== 'approved' && (
                    <ActionBtn color="green" icon={<LuCheck size={14}/>} title="Approve" onClick={() => handleApprove(r.id)} />
                  )}
                  {r.status !== 'rejected' && (
                    <ActionBtn color="red" icon={<LuX size={14}/>} title="Reject" onClick={() => handleReject(r.id)} />
                  )}
                  <ActionBtn color="gray" icon={<LuTrash2 size={14}/>} title="Delete" onClick={() => handleDelete(r.id)} />
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
    green: 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-emerald-300',
    red:   'bg-rose-100 text-rose-700 hover:bg-rose-200 border-rose-300',
    gray:  'bg-slate-200 text-slate-700 hover:bg-slate-300 border-slate-300',
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