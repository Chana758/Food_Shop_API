
import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  LuRefreshCw, LuEye, LuX, LuTrash2,
  LuCircleCheck, LuUndo, LuClock, LuBell, LuDollarSign, LuCreditCard
} from 'react-icons/lu';
import usePayment from '../../hooks/usePayment';

// ── Constants ─────────────────────────────────────────────────────────────────
const STATUS_STYLES = {
  pending:  'bg-yellow-50 text-yellow-700 border-yellow-200',
  paid:     'bg-emerald-50 text-emerald-700 border-emerald-200',
  failed:   'bg-rose-50 text-rose-700 border-rose-200',
  refunded: 'bg-slate-100 text-slate-600 border-slate-300',
};

const METHOD_LABELS = { cash: 'Cash', khqr: 'KHQR', card: 'Card' };
const FILTERS = ['all', 'pending', 'paid', 'refunded', 'failed'];
const STORAGE_BASE = 'http://127.0.0.1:8000/storage/';

// ── Modal Wrapper ─────────────────────────────────────────────────────────────
const Modal = ({ onClose, children }) => (
  <div
    className="fixed inset-0 bg-slate-900/60 backdrop-blur-2xs flex items-center justify-center p-4 z-50"
    onClick={onClose}
  >
    <div
      className="bg-white rounded-xl p-6 w-full max-w-lg shadow-2xl border-2 border-slate-300 max-h-[90vh] overflow-y-auto"
      onClick={e => e.stopPropagation()}
    >
      {children}
    </div>
  </div>
);

// ── Main Component ────────────────────────────────────────────────────────────
const PaymentManagement = () => {
  const { searchTerm = '' } = useOutletContext() || {};

  const {
    payments, pendingCount, loading, error, lastUpdated,
    fetchPayments, confirmPayment, refundPayment, removePayment,
  } = usePayment();

  const [activeFilter, setActiveFilter] = useState('all');
  const [viewing,   setViewing]         = useState(null);
  const [deleting,  setDeleting]        = useState(null);
  const [submitting, setSubmitting]     = useState(false);
  const [toastMsg,  setToastMsg]        = useState(null);

  // ── Filter & Search ───────────────────────────────────────────────────────
  const filtered = payments.filter(p => {
    const matchesFilter = activeFilter === 'all' || p.status === activeFilter;
    const matchesSearch = 
      p.id?.toString().includes(searchTerm) ||
      p.order_id?.toString().includes(searchTerm) ||
      p.user?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const counts = payments.reduce(
    (acc, p) => ({ ...acc, [p.status]: (acc[p.status] || 0) + 1 }), {}
  );

  const totalRevenue = payments
    .filter(p => p.status === 'paid')
    .reduce((sum, p) => sum + Number(p.amount ?? 0), 0);

  // ── Toast helper ──────────────────────────────────────────────────────────
  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // ── Confirm ───────────────────────────────────────────────────────────────
  const handleConfirm = async (id) => {
    try {
      await confirmPayment(id);
      showToast('✅ Payment confirmed! Order marked as Paid.');
    } catch {
      showToast('❌ Failed to confirm. Please retry.');
    }
  };

  // ── Refund ────────────────────────────────────────────────────────────────
  const handleRefund = async (id) => {
    if (window.confirm("Are you sure you want to refund this payment?")) {
      try {
        await refundPayment(id);
        showToast('↩️ Payment refunded successfully.');
      } catch {
        showToast('❌ Failed to refund. Please retry.');
      }
    }
  };

  // ── Delete ────────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    setSubmitting(true);
    try {
      await removePayment(deleting.id);
      setDeleting(null);
      showToast('🗑️ Payment deleted.');
    } catch {
      showToast('❌ Failed to delete.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Loading state ─────────────────────────────────────────────────────────
  if (loading) return (
    <div className="p-8 flex flex-col items-center justify-center min-h-[300px] gap-3">
      <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin" />
      <p className="text-xs font-black uppercase tracking-widest text-slate-400">Loading payments...</p>
    </div>
  );

  if (error) return (
    <div className="p-8 text-center text-rose-500 font-bold text-xs uppercase tracking-wider">
      {error}
      <button onClick={fetchPayments} className="ml-3 underline text-slate-500 hover:text-slate-900 cursor-pointer">
        Retry
      </button>
    </div>
  );

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="p-6 md:p-8 bg-slate-100 min-h-screen space-y-6 relative">

      {/* ── Toast Notification ──────────────────────────────────────────── */}
      {toastMsg && (
        <div className="fixed top-6 right-6 z-[999] bg-slate-900 text-white px-5 py-3 rounded-xl shadow-2xl text-xs font-bold uppercase tracking-wider animate-fade-in border border-slate-700">
          {toastMsg}
        </div>
      )}

      {/* ── HEADER ─────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border-2 border-slate-300 p-5 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-sm font-black text-slate-900 uppercase tracking-wide">Payment Management</h1>
          <p className="text-xs text-slate-500 font-semibold mt-0.5">Track and verify customer invoices</p>
          {lastUpdated && (
            <p className="text-[10px] text-slate-400 font-bold mt-1 flex items-center gap-1">
              <LuClock size={11} /> Auto-refresh — Last: {lastUpdated.toLocaleTimeString()}
            </p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchPayments}
            className="bg-white border-2 border-slate-300 text-slate-700 px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-slate-50 transition cursor-pointer shadow-sm flex items-center gap-2"
          >
            <LuRefreshCw size={14} /> Refresh
          </button>
        </div>
      </div>

      {/* ── STATS CARDS ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border-2 border-slate-300 p-5 shadow-sm relative overflow-hidden flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider mb-2">PENDING INVOICES</p>
              <h2 className="text-3xl font-black text-slate-900 mb-2">{pendingCount}</h2>
            </div>
            <div className="bg-yellow-50 p-3 rounded-xl text-yellow-700 border border-yellow-100 shadow-2xs">
              <LuBell size={20} />
            </div>
          </div>
          <p className="text-xs font-bold text-yellow-700">Awaiting confirmation</p>
        </div>

        <div className="bg-white rounded-xl border-2 border-slate-300 p-5 shadow-sm relative overflow-hidden flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider mb-2">TOTAL REVENUE (PAID)</p>
              <h2 className="text-3xl font-black text-emerald-600 mb-2">${totalRevenue.toFixed(2)}</h2>
            </div>
            <div className="bg-emerald-50 p-3 rounded-xl text-emerald-700 border border-emerald-100 shadow-2xs">
              <LuDollarSign size={20} />
            </div>
          </div>
          <p className="text-xs font-bold text-emerald-700">Verified transactions</p>
        </div>
      </div>

      {/* ── Filter Tabs ─────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {FILTERS.map(f => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className={`px-4 py-2.5 rounded-lg text-xs font-black uppercase tracking-wider whitespace-nowrap transition cursor-pointer shadow-2xs border ${
              activeFilter === f
                ? 'bg-slate-900 text-white border-slate-900'
                : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {f}
            {f !== 'all' && counts[f] > 0 && (
              <span className={`ml-1.5 px-1.5 py-0.5 rounded text-[10px] ${activeFilter === f ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600'}`}>
                {counts[f]}
              </span>
            )}
            {f === 'pending' && pendingCount > 0 && activeFilter !== 'pending' && (
              <span className="ml-1 inline-block w-2 h-2 bg-rose-500 rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* ── Payments Table ───────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl shadow-sm border-2 border-slate-300 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50 text-slate-600 text-[11px] font-black uppercase tracking-wider border-b-2 border-slate-300">
            <tr>
              <th className="px-5 py-3 w-16">ID</th>
              <th className="px-5 py-3 w-20">Order</th>
              <th className="px-5 py-3">Customer</th>
              <th className="px-5 py-3">Amount</th>
              <th className="px-5 py-3">Method</th>
              <th className="px-5 py-3 w-28">Status</th>
              <th className="px-5 py-3">Paid At</th>
              <th className="px-5 py-3 text-center w-40">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {filtered.map(payment => (
              <tr
                key={payment.id}
                className={`hover:bg-slate-50/80 transition-colors ${payment.status === 'pending' ? 'bg-yellow-50/20' : ''}`}
              >
                <td className="px-5 py-3.5 font-black text-xs text-slate-400">#{payment.id}</td>
                <td className="px-5 py-3.5 font-bold text-xs text-slate-500">#{payment.order_id}</td>
                <td className="px-5 py-3.5 font-bold text-xs text-slate-900">{payment.user?.name ?? '—'}</td>
                <td className="px-5 py-3.5 font-black text-xs text-emerald-700">
                  ${Number(payment.amount ?? 0).toFixed(2)}
                </td>
                <td className="px-5 py-3.5 text-slate-600 text-xs font-bold uppercase">
                  {METHOD_LABELS[payment.method] ?? payment.method}
                </td>
                <td className="px-5 py-3.5">
                  <span className={`text-[10px] font-black px-2.5 py-1 rounded-md border uppercase tracking-widest shadow-2xs ${STATUS_STYLES[payment.status] ?? STATUS_STYLES.pending}`}>
                    {payment.status}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-slate-500 text-xs font-medium">
                  {payment.paid_at
                    ? new Date(payment.paid_at).toLocaleString()
                    : <span className="text-slate-300">—</span>
                  }
                </td>
                <td className="px-5 py-3.5">
                  <div className="flex justify-center gap-1.5">
                    {/* View details */}
                    <button
                      onClick={() => setViewing(payment)}
                      className="p-2 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-lg cursor-pointer transition shadow-2xs"
                      title="View details"
                    >
                      <LuEye size={13} />
                    </button>

                    {/* Confirm — pending only */}
                    {payment.status === 'pending' && (
                      <button
                        onClick={() => handleConfirm(payment.id)}
                        className="p-2 bg-emerald-50 border border-emerald-300 hover:bg-emerald-100 text-emerald-700 rounded-lg cursor-pointer transition shadow-2xs"
                        title="Confirm payment"
                      >
                        <LuCircleCheck size={13} />
                      </button>
                    )}

                    {/* Refund — paid only */}
                    {payment.status === 'paid' && (
                      <button
                        onClick={() => handleRefund(payment.id)}
                        className="p-2 bg-amber-50 border border-amber-300 hover:bg-amber-100 text-amber-700 rounded-lg cursor-pointer transition shadow-2xs"
                        title="Refund payment"
                      >
                        <LuUndo size={13} />
                      </button>
                    )}

                    {/* Delete */}
                    <button
                      onClick={() => setDeleting(payment)}
                      className="p-2 bg-white border border-rose-300 hover:bg-rose-50 text-rose-600 rounded-lg cursor-pointer transition shadow-2xs"
                      title="Delete"
                    >
                      <LuTrash2 size={13} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} className="text-center py-12 text-slate-500 font-bold text-xs uppercase tracking-wider">
                  {searchTerm ? `No payments match "${searchTerm}"` : 'No payment transactions found.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ── VIEW Modal ───────────────────────────────────────────────────── */}
      {viewing && (
        <Modal onClose={() => setViewing(null)}>
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <h2 className="text-xs font-black uppercase text-slate-900 tracking-wider">
              Payment Details #{viewing.id}
            </h2>
            <button onClick={() => setViewing(null)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
              <LuX size={16} />
            </button>
          </div>

          <div className="space-y-3 text-xs pt-4">
            {[
              { label: 'Order ID',    value: `#${viewing.order_id}` },
              { label: 'Customer',    value: viewing.user?.name ?? '—' },
              { label: 'Amount',      value: `$${Number(viewing.amount ?? 0).toFixed(2)}` },
              { label: 'Method',      value: METHOD_LABELS[viewing.method] ?? viewing.method },
              { label: 'Status',      value: viewing.status },
              { label: 'Reference',   value: viewing.transaction_ref ?? '—' },
              { label: 'Paid At',     value: viewing.paid_at ? new Date(viewing.paid_at).toLocaleString() : '—' },
              { label: 'Created At',  value: new Date(viewing.created_at).toLocaleString() },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between items-center py-1.5 border-b border-slate-100">
                <span className="text-[10px] font-black uppercase text-slate-400">{label}</span>
                <span className={`font-bold uppercase ${label === 'Status' ? `px-2 py-0.5 rounded text-[10px] border ${STATUS_STYLES[value] ?? ''}` : 'text-slate-900'}`}>
                  {value}
                </span>
              </div>
            ))}

            {/* ── Receipt Image ── */}
            {viewing.receipt_image && (
              <div className="pt-3">
                <span className="block text-[10px] font-black uppercase text-slate-400 mb-2">
                  KHQR Receipt Screenshot
                </span>
                <img
                  src={`${STORAGE_BASE}${viewing.receipt_image}`}
                  alt="Payment Receipt"
                  className="w-full rounded-lg border-2 border-slate-300 shadow-sm object-contain max-h-[250px] bg-slate-50"
                  onError={e => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
                <div
                  className="hidden items-center justify-center h-20 bg-slate-50 border-2 border-dashed border-slate-300 rounded-lg text-slate-400 text-xs font-bold uppercase"
                >
                  Receipt image not found
                </div>
              </div>
            )}

            {/* ── Order Items ── */}
            {viewing.order?.items?.length > 0 && (
              <div className="pt-2">
                <span className="block text-[10px] font-black uppercase text-slate-400 mb-2">
                  Order Items
                </span>
                <div className="bg-slate-50 rounded-lg border border-slate-200 p-3 space-y-2">
                  {viewing.order.items.map(item => (
                    <div
                      key={item.id}
                      className="flex justify-between text-xs font-bold text-slate-700 pb-1.5 border-b border-slate-200 last:border-0 last:pb-0"
                    >
                      <span>{item.product?.name ?? `#${item.product_id}`} × {item.quantity}</span>
                      <span className="text-emerald-700">${Number(item.subtotal ?? 0).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Action buttons inside modal */}
          <div className="flex gap-2.5 pt-4 mt-2 border-t border-slate-200">
            {viewing.status === 'pending' && (
              <button
                onClick={() => { handleConfirm(viewing.id); setViewing(null); }}
                className="flex-1 bg-emerald-600 text-white py-2.5 rounded-lg text-xs font-black uppercase tracking-wider hover:bg-emerald-700 transition cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
              >
                <LuCircleCheck size={14} /> Confirm Payment
              </button>
            )}
            <button
              onClick={() => setViewing(null)}
              className="flex-1 bg-slate-900 text-white py-2.5 rounded-lg text-xs font-black uppercase tracking-wider hover:bg-slate-800 transition cursor-pointer shadow-sm"
            >
              Close
            </button>
          </div>
        </Modal>
      )}

      {/* ── DELETE Confirm Modal ─────────────────────────────────────────── */}
      {deleting && (
        <Modal onClose={() => setDeleting(null)}>
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <h2 className="text-xs font-black uppercase text-slate-900 tracking-wider">Delete Payment</h2>
            <button onClick={() => setDeleting(null)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
              <LuX size={16} />
            </button>
          </div>
          <div className="py-4 space-y-1 text-xs">
            <p className="text-slate-700 font-bold">
              Are you sure you want to delete <span className="font-black text-slate-900">Payment #{deleting.id}</span>?
            </p>
            <p className="text-slate-400 font-semibold">This action cannot be undone.</p>
          </div>
          <div className="flex gap-2.5 pt-2">
            <button
              onClick={() => setDeleting(null)}
              className="flex-1 py-2.5 border-2 border-slate-300 rounded-lg font-bold text-xs uppercase tracking-wider hover:bg-slate-100 cursor-pointer text-slate-700 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={submitting}
              className="flex-1 py-2.5 bg-rose-600 text-white rounded-lg font-bold text-xs uppercase tracking-wider hover:bg-rose-700 cursor-pointer transition shadow-sm disabled:opacity-50"
            >
              {submitting ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </Modal>
      )}

    </div>
  );
};

export default PaymentManagement;