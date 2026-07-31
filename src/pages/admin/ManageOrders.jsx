
import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  LuEye, LuX, LuArrowRight,
  LuUtensilsCrossed, LuShoppingBag,
  LuTrash2, LuRefreshCw, LuClipboardList, LuClock
} from 'react-icons/lu';
import useOrder from '../../hooks/useOrder';

const STATUS_FLOW = ['pending', 'cooking', 'served'];
const ALL_STATUSES = [...STATUS_FLOW, 'paid', 'refunded', 'cancelled'];

const STATUS_STYLES = {
  pending:   'bg-yellow-50 text-yellow-700 border-yellow-200',
  cooking:   'bg-blue-50 text-blue-700 border-blue-200',
  served:    'bg-purple-50 text-purple-700 border-purple-200',
  paid:      'bg-emerald-50 text-emerald-700 border-emerald-200',
  refunded:  'bg-slate-100 text-slate-600 border-slate-300',
  cancelled: 'bg-rose-50 text-rose-700 border-rose-200',
};

const FILTERS = ['all', ...ALL_STATUSES];

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

const ManageOrders = () => {
  const { searchTerm = '' } = useOutletContext() || {};
  const { orders, loading, error, fetchOrders, advanceStatus, removeOrder } = useOrder();

  const [activeFilter, setActiveFilter] = useState('all');
  const [viewing, setViewing]           = useState(null);
  const [deleting, setDeleting]         = useState(null);
  const [submitting, setSubmitting]     = useState(false);

  // Filter & Search
  const filtered = orders.filter(o => {
    const matchesStatus = activeFilter === 'all' || o.status === activeFilter;
    const searchVal = searchTerm.toLowerCase();
    const matchesSearch = 
      String(o.id).includes(searchVal) ||
      (o.user?.name ?? '').toLowerCase().includes(searchVal);
    return matchesStatus && matchesSearch;
  });

  const counts = orders.reduce(
    (acc, o) => ({ ...acc, [o.status]: (acc[o.status] || 0) + 1 }), {}
  );

  const handleAdvance = async (id) => {
    await advanceStatus(id);
  };

  const handleDelete = async () => {
    setSubmitting(true);
    try {
      await removeOrder(deleting.id);
      setDeleting(null);
    } catch {
      // error handled in hook
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="p-8 flex flex-col items-center justify-center min-h-[300px] gap-3">
      <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin" />
      <p className="text-xs font-black uppercase tracking-widest text-slate-400">Loading orders...</p>
    </div>
  );

  if (error) return (
    <div className="p-8 text-center text-rose-500 font-bold text-xs uppercase tracking-wider">
      {error}
      <button
        onClick={() => fetchOrders()}
        className="ml-3 underline text-slate-500 hover:text-slate-900 cursor-pointer"
      >
        Retry
      </button>
    </div>
  );

  return (
    <div className="p-6 md:p-8 bg-slate-100 min-h-screen space-y-6">
      
      {/* ── HEADER & REFRESH ── */}
      <div className="bg-white rounded-xl border-2 border-slate-300 p-5 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-sm font-black text-slate-900 uppercase tracking-wide">Order Management</h1>
          <p className="text-xs text-slate-500 font-semibold mt-0.5">Track and manage incoming food orders seamlessly from kitchen to payment</p>
        </div>
        <button
          onClick={() => fetchOrders()}
          className="bg-white border-2 border-slate-300 text-slate-700 px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-slate-50 transition cursor-pointer shadow-sm flex items-center gap-2"
        >
          <LuRefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      {/* ── FILTER TABS ── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {FILTERS.map(f => {
          const isActive = activeFilter === f;
          return (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`px-4 py-2.5 rounded-lg text-xs font-black uppercase tracking-wider whitespace-nowrap transition cursor-pointer shadow-2xs border ${
                isActive
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {f}
              {f !== 'all' && counts[f] > 0 && (
                <span className={`ml-1.5 px-1.5 py-0.5 rounded text-[10px] ${isActive ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600'}`}>
                  {counts[f]}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── TABLE CONTAINER ── */}
      <div className="bg-white rounded-xl shadow-sm border-2 border-slate-300 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50 text-slate-600 text-[11px] font-black uppercase tracking-wider border-b-2 border-slate-300">
            <tr>
              <th className="px-5 py-3 w-20">Order ID</th>
              <th className="px-5 py-3">Customer</th>
              <th className="px-5 py-3">Type & Location</th>
              <th className="px-5 py-3">Total Amount</th>
              <th className="px-5 py-3 w-28">Status</th>
              <th className="px-5 py-3">Placed At</th>
              <th className="px-5 py-3 text-center w-48">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {filtered.map(order => (
              <tr
                key={order.id}
                className="hover:bg-slate-50/80 transition-colors"
              >
                <td className="px-5 py-3.5 font-black text-xs text-slate-400">
                  #{order.id}
                </td>
                <td className="px-5 py-3.5 font-bold text-xs text-slate-900">
                  {order.user?.name ?? '—'}
                </td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-2">
                    {order.order_type === 'dine-in' ? (
                      <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs">
                        <LuUtensilsCrossed size={13} />
                      </div>
                    ) : (
                      <div className="p-1.5 rounded-lg bg-amber-50 text-amber-700 border border-amber-200 shadow-2xs">
                        <LuShoppingBag size={13} />
                      </div>
                    )}
                    <span className="font-bold text-xs text-slate-800">
                      {order.order_type === 'dine-in' ? order.table?.name ?? 'Dine-in' : 'Takeaway'}
                    </span>
                  </div>
                </td>
                <td className="px-5 py-3.5 font-black text-xs text-emerald-700">
                  ${Number(order.total_amount).toFixed(2)}
                </td>
                <td className="px-5 py-3.5">
                  <span className={`text-[10px] font-black px-2.5 py-1 rounded-md border uppercase tracking-widest shadow-2xs ${STATUS_STYLES[order.status] ?? 'bg-slate-50 text-slate-500 border-slate-200'}`}>
                    {order.status}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-slate-500 text-xs font-medium">
                  {order.created_at?.slice(0, 16).replace('T', ' ')}
                </td>
                <td className="px-5 py-3.5">
                  <div className="flex justify-center items-center gap-1.5">
                    {/* View Details Button */}
                    <button
                      onClick={() => setViewing(order)}
                      className="p-2 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-lg cursor-pointer transition shadow-2xs"
                      title="View details"
                    >
                      <LuEye size={13} />
                    </button>

                    {/* Advance Status Button */}
                    {STATUS_FLOW.includes(order.status) && STATUS_FLOW.indexOf(order.status) < STATUS_FLOW.length - 1 && (
                      <button
                        onClick={() => handleAdvance(order.id)}
                        className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-[10px] font-black uppercase tracking-wider transition cursor-pointer shadow-2xs flex items-center gap-1"
                        title={`Advance to ${STATUS_FLOW[STATUS_FLOW.indexOf(order.status) + 1]}`}
                      >
                        <span>Advance</span>
                        <LuArrowRight size={11} />
                      </button>
                    )}

                    {/* Status Served Notice */}
                    {order.status === 'served' && (
                      <span className="px-2 py-1 bg-amber-50 text-amber-700 border border-amber-300 rounded-lg text-[9px] font-black uppercase tracking-wider">
                        Awaiting Payment
                      </span>
                    )}

                    {/* Delete Button */}
                    <button
                      onClick={() => setDeleting(order)}
                      className="p-2 bg-white border border-rose-300 hover:bg-rose-50 text-rose-600 rounded-lg cursor-pointer transition shadow-2xs"
                      title="Delete order"
                    >
                      <LuTrash2 size={13} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center py-12 text-slate-500 font-bold text-xs uppercase tracking-wider">
                  {searchTerm ? `No orders match "${searchTerm}"` : 'No orders found matching your criteria.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ── VIEW DETAILS MODAL ── */}
      {viewing && (
        <Modal onClose={() => setViewing(null)}>
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <h2 className="text-xs font-black uppercase text-slate-900 tracking-wider">
              Order Details #{viewing.id}
            </h2>
            <button 
              onClick={() => setViewing(null)} 
              className="text-slate-400 hover:text-slate-700 cursor-pointer"
            >
              <LuX size={16} />
            </button>
          </div>

          <div className="space-y-3 pt-4 text-xs">
            <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
              <div>
                <span className="text-[10px] font-black uppercase text-slate-400 block mb-0.5">Customer</span>
                <span className="font-bold text-slate-900">{viewing.user?.name ?? '—'}</span>
              </div>
              <div>
                <span className="text-[10px] font-black uppercase text-slate-400 block mb-0.5">Order Type</span>
                <span className="font-bold text-slate-900">
                  {viewing.order_type === 'dine-in' ? viewing.table?.name ?? 'Dine-in' : 'Takeaway'}
                </span>
              </div>
              <div>
                <span className="text-[10px] font-black uppercase text-slate-400 block mb-0.5">Status</span>
                <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider border ${STATUS_STYLES[viewing.status]}`}>
                  {viewing.status}
                </span>
              </div>
              <div>
                <span className="text-[10px] font-black uppercase text-slate-400 block mb-0.5">Placed At</span>
                <span className="font-bold text-slate-700">{viewing.created_at?.slice(0, 16).replace('T', ' ')}</span>
              </div>
            </div>

            {/* Items List */}
            {viewing.items?.length > 0 && (
              <div>
                <span className="block text-[10px] font-black uppercase text-slate-400 mb-2">
                  Ordered Items ({viewing.items.length})
                </span>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {viewing.items.map(item => (
                    <div
                      key={item.id}
                      className="flex justify-between items-center bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-xs font-bold"
                    >
                      <div>
                        <span className="text-slate-900 block">{item.product?.name ?? `Product #${item.product_id}`}</span>
                        {item.note && (
                          <span className="text-amber-700 font-semibold text-[10px] mt-0.5 block">
                            Note: {item.note}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-right">
                        <span className="text-slate-500">× {item.quantity}</span>
                        <span className="text-emerald-700">${Number(item.subtotal).toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-200">
                  <span className="text-[10px] font-black uppercase text-slate-500">Total Amount</span>
                  <span className="text-base font-black text-emerald-700">
                    ${Number(viewing.total_amount).toFixed(2)}
                  </span>
                </div>
              </div>
            )}

            {viewing.notes && (
              <div className="bg-amber-50 p-3 rounded-lg border border-amber-200 text-xs">
                <span className="font-black text-amber-800 uppercase tracking-wider text-[10px] block mb-1">
                  Order Special Note
                </span>
                <p className="text-slate-700 font-semibold">{viewing.notes}</p>
              </div>
            )}
          </div>

          <button
            onClick={() => setViewing(null)}
            className="mt-4 w-full bg-slate-900 hover:bg-slate-800 text-white py-2.5 rounded-lg text-xs font-black uppercase tracking-wider transition cursor-pointer shadow-sm"
          >
            Close
          </button>
        </Modal>
      )}

      {/* ── DELETE CONFIRMATION MODAL ── */}
      {deleting && (
        <Modal onClose={() => setDeleting(null)}>
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <h2 className="text-xs font-black uppercase text-slate-900 tracking-wider">Delete Order</h2>
            <button 
              onClick={() => setDeleting(null)} 
              className="text-slate-400 hover:text-slate-700 cursor-pointer"
            >
              <LuX size={16} />
            </button>
          </div>

          <div className="py-4 space-y-3 text-xs">
            <p className="text-slate-700 font-bold">
              Are you sure you want to delete <span className="font-black text-slate-900">Order #{deleting.id}</span>?
            </p>
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 font-semibold">
              ⚠️ Stock will be restored automatically. This action cannot be undone.
            </div>
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
              {submitting ? 'Deleting...' : 'Confirm Delete'}
            </button>
          </div>
        </Modal>
      )}

    </div>
  );
};

export default ManageOrders;