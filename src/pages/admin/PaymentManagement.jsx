import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  LuRefreshCw, LuEye, LuX, LuTrash2,
  LuCircleCheck, LuUndo, LuClock, LuBell, LuDollarSign
} from 'react-icons/lu';
import usePayment from '../../hooks/usePayment';
import { useTranslation } from 'react-i18next';

const FONT_SERIF = { fontFamily: "'Fraunces', Georgia, serif" };
const CARD = "bg-white rounded-xl border border-[#E8E3D8] shadow-[0_1px_3px_rgba(30,42,46,0.05)]";
const PAGE_BG = "var(--page-bg)";

const STATUS_STYLES = {
  pending:  'bg-[#FBEDD9] text-[#8A5A12] border-[#F1D9AE]',
  paid:     'bg-[#E4F0E7] text-[#2F6844] border-[#C7E0CD]',
  failed:   'bg-[#F5E1DE] text-[#8C3327] border-[#EBC7C1]',
  refunded: 'bg-[#F1EFE9] text-[#6B6259] border-[#E3DFD3]',
};

// payment method -> translation key
const METHOD_LABELS = { cash: 'paymentMethod.cash', khqr: 'paymentMethod.khqr', card: 'paymentMethod.card' };
const FILTERS = ['all', 'pending', 'paid', 'refunded', 'failed'];

// fall back to the live backend (was 127.0.0.1, so receipts were broken on Vercel)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://food-shop-backend-xivl.onrender.com';
const STORAGE_BASE = `${API_BASE_URL.replace(/\/$/, '')}/storage/`;

const ITEMS_PER_PAGE = 10;

const Modal = ({ onClose, children }) => (
  <div
    className="fixed inset-0 bg-[#1E2A2E]/60 backdrop-blur-2xs flex items-center justify-center p-4 z-50"
    onClick={onClose}
  >
    <div
      className="bg-white rounded-xl p-6 w-full max-w-lg shadow-2xl border border-[#E8E3D8] max-h-[90vh] overflow-y-auto"
      onClick={e => e.stopPropagation()}
    >
      {children}
    </div>
  </div>
);

const PaymentManagement = () => {
  const { t, i18n } = useTranslation();
  const { searchTerm = '' } = useOutletContext() || {};
  const locale = i18n.language === 'kh' ? 'km-KH' : 'en-US';

  const {
    payments, pendingCount, loading, error, lastUpdated,
    fetchPayments, confirmPayment, refundPayment, removePayment,
  } = usePayment();

  const [activeFilter, setActiveFilter] = useState('all');
  const [viewing,   setViewing]         = useState(null);
  const [deleting,  setDeleting]        = useState(null);
  const [submitting, setSubmitting]     = useState(false);
  const [toastMsg,  setToastMsg]        = useState(null);
  const [currentPage, setCurrentPage]   = useState(1);

  const filtered = payments.filter(p => {
    const matchesFilter = activeFilter === 'all' || p.status === activeFilter;
    const matchesSearch = 
      p.id?.toString().includes(searchTerm) ||
      p.order_id?.toString().includes(searchTerm) ||
      p.user?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const totalPages   = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const pagedPayments = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  useEffect(() => { setCurrentPage(1); }, [activeFilter, searchTerm]);

  const counts = payments.reduce(
    (acc, p) => ({ ...acc, [p.status]: (acc[p.status] || 0) + 1 }), {}
  );

  const totalRevenue = payments
    .filter(p => p.status === 'paid')
    .reduce((sum, p) => sum + Number(p.amount ?? 0), 0);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Confirm payment with error handling to display the actual message from the backend
  const handleConfirm = async (id) => {
    try {
      await confirmPayment(id);
      showToast(`✅ ${t('admin.payments.confirmed')}`);
    } catch (err) {
      showToast(`❌ ${err?.response ? t('admin.payments.confirmFailed') : t('error.network')}`);
    }
  };

 // Payment refund with error handling to display the actual message from the backend
  const handleRefund = async (id) => {
    if (window.confirm(t('admin.payments.confirmRefund'))) {
      try {
        await refundPayment(id);
        showToast(`↩️ ${t('admin.payments.refunded')}`);
      } catch (err) {
        showToast(`❌ ${err?.response ? t('admin.payments.refundFailed') : t('error.network')}`);
      }
    }
  };

  // Delete payment
  const handleDelete = async () => {
    setSubmitting(true);
    try {
      await removePayment(deleting.id);
      setDeleting(null);
      showToast(`🗑️ ${t('admin.payments.deleted')}`);
    } catch (err) {
      showToast(`❌ ${err?.response ? t('admin.payments.deleteFailed') : t('error.network')}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="p-8 flex flex-col items-center justify-center min-h-[300px] gap-3">
      <div className="w-8 h-8 border-4 border-[#E8E3D8] border-t-[#1E2A2E] rounded-full animate-spin" />
      <p className="text-xs font-black uppercase tracking-widest text-[#9AA0A0]">{t('common.loading')}</p>
    </div>
  );

  if (error) return (
    <div className="p-8 text-center text-[#B5453B] font-bold text-xs uppercase tracking-wider">
      {t('admin.payments.loadFailed')}
      <button onClick={fetchPayments} className="ml-3 underline text-[#5B6B6F] hover:text-[#1E2A2E] cursor-pointer">
        {t('error.retry')}
      </button>
    </div>
  );

  return (
    <div className="p-6 md:p-8 min-h-screen space-y-6 relative" style={{ background: PAGE_BG }}>

      {toastMsg && (
        <div className="fixed top-6 right-6 z-[999] bg-[#1E2A2E] text-white px-5 py-3 rounded-xl shadow-2xl text-xs font-bold uppercase tracking-wider animate-fade-in border border-[#2A3B3F]">
          {toastMsg}
        </div>
      )}

      <div className={`${CARD} p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4`}>
        <div>
          <h1 style={FONT_SERIF} className="text-[16px] font-semibold text-[#1E2A2E]">{t('admin.page.payments')}</h1>
          <p className="text-xs text-[#8B9296] font-semibold mt-0.5">{t('admin.payments.subtitle')}</p>
          {lastUpdated && (
            <p className="text-[10px] text-[#9AA0A0] font-bold mt-1 flex items-center gap-1">
              <LuClock size={11} /> {t('admin.payments.autoRefresh')}: {lastUpdated.toLocaleTimeString(locale)}
            </p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchPayments}
            className="bg-white border border-[#E8E3D8] text-[#5B6B6F] px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-[#FBF9F5] transition cursor-pointer shadow-sm flex items-center gap-2"
          >
            <LuRefreshCw size={14} /> {t('admin.common.refresh')}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-[#B5453B] rounded-xl p-5 shadow-[0_4px_14px_rgba(30,42,46,0.12)] relative overflow-hidden flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-black uppercase text-white/70 tracking-wider mb-2">{t('admin.payments.pendingInvoices')}</p>
              <h2 className="text-3xl font-black text-white mb-2">{pendingCount}</h2>
            </div>
            <div className="bg-white/20 p-3 rounded-xl text-white">
              <LuBell size={20} />
            </div>
          </div>
          <p className="text-xs font-bold text-[#F3D4D0]">{t('admin.payments.awaiting')}</p>
        </div>

        <div className="bg-[#3F7D58] rounded-xl p-5 shadow-[0_4px_14px_rgba(30,42,46,0.12)] relative overflow-hidden flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-black uppercase text-white/70 tracking-wider mb-2">{t('admin.payments.totalRevenue')}</p>
              <h2 className="text-3xl font-black text-white mb-2">${totalRevenue.toFixed(2)}</h2>
            </div>
            <div className="bg-white/20 p-3 rounded-xl text-white">
              <LuDollarSign size={20} />
            </div>
          </div>
          <p className="text-xs font-bold text-[#CFE7D7]">{t('admin.payments.verified')}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {FILTERS.map(f => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className={`px-4 py-2.5 rounded-lg text-xs font-black uppercase tracking-wider whitespace-nowrap transition cursor-pointer shadow-2xs border ${
              activeFilter === f
                ? 'bg-[#1E2A2E] text-white border-[#1E2A2E]'
                : 'bg-white border-[#E8E3D8] text-[#5B6B6F] hover:bg-[#FBF9F5]'
            }`}
          >
            {t(`status.${f}`)}
            {f !== 'all' && counts[f] > 0 && (
              <span className={`ml-1.5 px-1.5 py-0.5 rounded text-[10px] ${activeFilter === f ? 'bg-white/20 text-white' : 'bg-[#F1EFE9] text-[#5B6B6F]'}`}>
                {counts[f]}
              </span>
            )}
            {f === 'pending' && pendingCount > 0 && activeFilter !== 'pending' && (
              <span className="ml-1 inline-block w-2 h-2 bg-[#B5453B] rounded-full" />
            )}
          </button>
        ))}
      </div>

      <div className={`${CARD} overflow-hidden`}>
        <table className="w-full text-left border-collapse">
          <thead className="bg-[#FBF9F5] text-[#8B9296] text-[11px] font-black uppercase tracking-wider border-b border-[#EFEBE2]">
            <tr>
              <th className="px-5 py-3 w-16">ID</th>
              <th className="px-5 py-3 w-20">{t('admin.payments.order')}</th>
              <th className="px-5 py-3">{t('admin.common.customer')}</th>
              <th className="px-5 py-3">{t('admin.common.amount')}</th>
              <th className="px-5 py-3">{t('admin.payments.method')}</th>
              <th className="px-5 py-3 w-28">{t('admin.common.status')}</th>
              <th className="px-5 py-3">{t('admin.payments.paidAt')}</th>
              <th className="px-5 py-3 text-center w-40">{t('admin.common.actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EFEBE2]">
            {pagedPayments.map(payment => (
              <tr
                key={payment.id}
                className={`hover:bg-[#FBF9F5] transition-colors ${payment.status === 'pending' ? 'bg-[#FBEDD9]/20' : ''}`}
              >
                <td className="px-5 py-3.5 font-black text-xs text-[#C4C0B4]">#{payment.id}</td>
                <td className="px-5 py-3.5 font-bold text-xs text-[#9AA0A0]">#{payment.order_id}</td>
                <td className="px-5 py-3.5 font-bold text-xs text-[#1E2A2E]">{payment.user?.name ?? '—'}</td>
                <td className="px-5 py-3.5 font-black text-xs text-[#2F6844]">
                  ${Number(payment.amount ?? 0).toFixed(2)}
                </td>
                <td className="px-5 py-3.5 text-[#5B6B6F] text-xs font-bold uppercase">
                  {METHOD_LABELS[payment.method] ? t(METHOD_LABELS[payment.method]) : payment.method}
                </td>
                <td className="px-5 py-3.5">
                  <span className={`text-[10px] font-black px-2.5 py-1 rounded-md border uppercase tracking-widest ${STATUS_STYLES[payment.status] ?? STATUS_STYLES.pending}`}>
                    {t(`status.${payment.status}`, payment.status)}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-[#8B9296] text-xs font-medium">
                  {payment.paid_at
                    ? new Date(payment.paid_at).toLocaleString(locale)
                    : <span className="text-[#C4C0B4]">—</span>
                  }
                </td>
                <td className="px-5 py-3.5">
                  <div className="flex justify-center gap-1.5">
                    <button
                      onClick={() => setViewing(payment)}
                      className="p-2 bg-white border border-[#E8E3D8] hover:bg-[#FBF9F5] text-[#5B6B6F] rounded-lg cursor-pointer transition shadow-2xs"
                      title={t('admin.common.viewDetails')}
                    >
                      <LuEye size={13} />
                    </button>

                    {payment.status === 'pending' && (
                      <button
                        onClick={() => handleConfirm(payment.id)}
                        className="p-2 bg-[#E4F0E7] border border-[#C7E0CD] hover:bg-[#D3E7D9] text-[#2F6844] rounded-lg cursor-pointer transition shadow-2xs"
                        title={t('admin.payments.confirmPayment')}
                      >
                        <LuCircleCheck size={13} />
                      </button>
                    )}

                    {payment.status === 'paid' && (
                      <button
                        onClick={() => handleRefund(payment.id)}
                        className="p-2 bg-[#FBEDD9] border border-[#F1D9AE] hover:bg-[#F6E2C0] text-[#8A5A12] rounded-lg cursor-pointer transition shadow-2xs"
                        title={t('admin.payments.refundPayment')}
                      >
                        <LuUndo size={13} />
                      </button>
                    )}

                    <button
                      onClick={() => setDeleting(payment)}
                      className="p-2 bg-white border border-[#EBC7C1] hover:bg-[#F5E1DE] text-[#B5453B] rounded-lg cursor-pointer transition shadow-2xs"
                      title={t('common.delete')}
                    >
                      <LuTrash2 size={13} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} className="text-center py-12 text-[#9AA0A0] font-bold text-xs uppercase tracking-wider">
                  {searchTerm ? t('admin.common.noMatch', { term: searchTerm }) : t('admin.payments.none')}
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {totalPages > 1 && (
          <div className="p-3 flex justify-center items-center gap-1.5 border-t border-[#EFEBE2] bg-[#FBF9F5]">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 h-8 rounded-lg font-bold text-xs transition cursor-pointer border border-[#E8E3D8] bg-white text-[#5B6B6F] hover:bg-[#F3F0E9] disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {t('common.previous')}
            </button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`w-8 h-8 rounded-lg font-bold text-xs transition cursor-pointer border shadow-2xs ${
                  currentPage === i + 1
                    ? "bg-[#1E2A2E] text-white border-[#1E2A2E]"
                    : "bg-white border-[#E8E3D8] text-[#5B6B6F] hover:bg-[#FBF9F5]"
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 h-8 rounded-lg font-bold text-xs transition cursor-pointer border border-[#E8E3D8] bg-white text-[#5B6B6F] hover:bg-[#F3F0E9] disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {t('common.next')}
            </button>
          </div>
        )}
      </div>

      {viewing && (
        <Modal onClose={() => setViewing(null)}>
          <div className="flex items-center justify-between pb-3 border-b border-[#EFEBE2]">
            <h2 className="text-xs font-black uppercase text-[#1E2A2E] tracking-wider">
              {t('admin.payments.details')} #{viewing.id}
            </h2>
            <button onClick={() => setViewing(null)} className="text-[#9AA0A0] hover:text-[#1E2A2E] cursor-pointer">
              <LuX size={16} />
            </button>
          </div>

          <div className="space-y-3 text-xs pt-4">
            {[
              { label: t('orderHistory.orderID'),   value: `#${viewing.order_id}` },
              { label: t('admin.common.customer'),  value: viewing.user?.name ?? '—' },
              { label: t('admin.common.amount'),    value: `$${Number(viewing.amount ?? 0).toFixed(2)}` },
              { label: t('admin.payments.method'),  value: METHOD_LABELS[viewing.method] ? t(METHOD_LABELS[viewing.method]) : viewing.method },
              { label: t('admin.common.status'),    value: t(`status.${viewing.status}`, viewing.status), status: viewing.status },
              { label: t('admin.payments.reference'), value: viewing.transaction_ref ?? '—' },
              { label: t('admin.payments.paidAt'),  value: viewing.paid_at ? new Date(viewing.paid_at).toLocaleString(locale) : '—' },
              { label: t('admin.payments.createdAt'), value: new Date(viewing.created_at).toLocaleString(locale) },
            ].map(({ label, value, status }) => (
              <div key={label} className="flex justify-between items-center py-1.5 border-b border-[#F1EFE9]">
                <span className="text-[10px] font-black uppercase text-[#9AA0A0]">{label}</span>
                <span className={`font-bold uppercase ${status ? `px-2 py-0.5 rounded text-[10px] border ${STATUS_STYLES[status] ?? ''}` : 'text-[#1E2A2E]'}`}>
                  {value}
                </span>
              </div>
            ))}

            {viewing.receipt_image && (
              <div className="pt-3">
                <span className="block text-[10px] font-black uppercase text-[#9AA0A0] mb-2">
                  {t('admin.payments.receipt')}
                </span>
                <img
                  src={`${STORAGE_BASE}${viewing.receipt_image}`}
                  alt={t('admin.payments.receipt')}
                  className="w-full rounded-lg border border-[#E8E3D8] shadow-sm object-contain max-h-[250px] bg-[#FBF9F5]"
                  onError={e => {
                    e.target.style.display = 'none';
                    if (e.target.nextElementSibling) {
                      e.target.nextElementSibling.style.display = 'flex';
                    }
                  }}
                />
                <div
                  className="hidden items-center justify-center h-20 bg-[#FBF9F5] border-2 border-dashed border-[#E8E3D8] rounded-lg text-[#9AA0A0] text-xs font-bold uppercase"
                >
                  {t('admin.payments.receiptMissing')}
                </div>
              </div>
            )}

            {viewing.order?.items?.length > 0 && (
              <div className="pt-2">
                <span className="block text-[10px] font-black uppercase text-[#9AA0A0] mb-2">
                  {t('orderHistory.orderedItems')}
                </span>
                <div className="bg-[#FBF9F5] rounded-lg border border-[#E8E3D8] p-3 space-y-2">
                  {viewing.order.items.map(item => (
                    <div
                      key={item.id}
                      className="flex justify-between text-xs font-bold text-[#3A4548] pb-1.5 border-b border-[#EFEBE2] last:border-0 last:pb-0"
                    >
                      <span>{item.product?.name ?? `#${item.product_id}`} × {item.quantity}</span>
                      <span className="text-[#2F6844]">${Number(item.subtotal ?? 0).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-2.5 pt-4 mt-2 border-t border-[#EFEBE2]">
            {viewing.status === 'pending' && (
              <button
                onClick={() => { handleConfirm(viewing.id); setViewing(null); }}
                className="flex-1 bg-[#3F7D58] text-white py-2.5 rounded-lg text-xs font-black uppercase tracking-wider hover:bg-[#35674A] transition cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
              >
                <LuCircleCheck size={14} /> {t('admin.payments.confirmPayment')}
              </button>
            )}
            <button
              onClick={() => setViewing(null)}
              className="flex-1 bg-[#1E2A2E] text-white py-2.5 rounded-lg text-xs font-black uppercase tracking-wider hover:bg-[#2A3B3F] transition cursor-pointer shadow-sm"
            >
              {t('common.close')}
            </button>
          </div>
        </Modal>
      )}

      {deleting && (
        <Modal onClose={() => setDeleting(null)}>
          <div className="flex items-center justify-between pb-3 border-b border-[#EFEBE2]">
            <h2 className="text-xs font-black uppercase text-[#1E2A2E] tracking-wider">{t('admin.payments.deleteTitle')}</h2>
            <button onClick={() => setDeleting(null)} className="text-[#9AA0A0] hover:text-[#1E2A2E] cursor-pointer">
              <LuX size={16} />
            </button>
          </div>
          <div className="py-4 space-y-1 text-xs">
            <p className="text-[#3A4548] font-bold">
              {t('admin.payments.deleteQ')} <span className="font-black text-[#1E2A2E]">#{deleting.id}</span>?
            </p>
            <p className="text-[#9AA0A0] font-semibold">{t('admin.common.cannotUndo')}</p>
          </div>
          <div className="flex gap-2.5 pt-2">
            <button
              onClick={() => setDeleting(null)}
              className="flex-1 py-2.5 border border-[#E8E3D8] rounded-lg font-bold text-xs uppercase tracking-wider hover:bg-[#FBF9F5] cursor-pointer text-[#5B6B6F] transition"
            >
              {t('common.cancel')}
            </button>
            <button
              onClick={handleDelete}
              disabled={submitting}
              className="flex-1 py-2.5 bg-[#B5453B] text-white rounded-lg font-bold text-xs uppercase tracking-wider hover:bg-[#9C3B32] cursor-pointer transition shadow-sm disabled:opacity-50"
            >
              {submitting ? t('admin.common.deleting') : t('common.delete')}
            </button>
          </div>
        </Modal>
      )}

    </div>
  );
};

export default PaymentManagement;