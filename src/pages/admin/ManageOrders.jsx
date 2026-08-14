import React, { useState, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  LuEye, LuX, LuArrowRight,
  LuUtensilsCrossed, LuShoppingBag, LuBike,
  LuTrash2, LuRefreshCw, LuClipboardList, LuClock
} from 'react-icons/lu';
import useOrder from '../../hooks/useOrder';
import orderService from '../../service/orderService';

/*
  Palette matched to the Khmer-Fresh admin (see Dashboard / Contacts /
  Delivery / Categories / Reservations / Reviews / Payments / Products):
  Ink #1E2A2E · Gold #D99A3D · Herb #3F7D58 · Sky #3B6E91 · Plum #7A4F6D · Chili #B5453B

  CHANGED — PAGE_BG now reads the live --page-bg CSS variable set by
  SettingsContext.jsx from Settings > Appearance & Branding. If the
  customer chose "Page Content" as the theme target, this becomes a soft
  tint of their accent color; if they chose "Sidebar & Header" instead,
  this stays the fixed cream/dark brand background. Every status pill,
  badge, and semantic color below (STATUS_STYLES etc.) is intentionally
  LEFT UNCHANGED — those carry meaning (pending/cooking/served) and must
  not shift with the customer's accent choice.
*/
const FONT_SERIF = { fontFamily: "'Fraunces', Georgia, serif" };
const CARD = "bg-white rounded-xl border border-[#E8E3D8] shadow-[0_1px_3px_rgba(30,42,46,0.05)]";
const PAGE_BG = "var(--page-bg)"; // was: "#FBF9F5"

const STATUS_FLOW = ['pending', 'cooking', 'served'];
const ALL_STATUSES = [...STATUS_FLOW, 'paid', 'refunded', 'cancelled'];

const STATUS_STYLES = {
  pending:   'bg-[#FBEDD9] text-[#8A5A12] border-[#F1D9AE]',
  cooking:   'bg-[#E3EDF3] text-[#2E5975] border-[#C9DCE8]',
  served:    'bg-[#EFE6EC] text-[#6B3D5C] border-[#DCC9D6]',
  paid:      'bg-[#E4F0E7] text-[#2F6844] border-[#C7E0CD]',
  refunded:  'bg-[#F1EFE9] text-[#6B6259] border-[#E3DFD3]',
  cancelled: 'bg-[#F5E1DE] text-[#8C3327] border-[#EBC7C1]',
};

const FILTERS = ['all', ...ALL_STATUSES];
const ITEMS_PER_PAGE = 10;

// ✅ FIX: order_type → icon + label lookup, used for both the table rows
// and the details modal.
//
// ROOT CAUSE OF THE BUG THIS FIXES: the old code only branched on
// order_type === 'dine-in' — everything else (including 'delivery')
// fell into the same "else" bucket that rendered a shopping-bag icon
// and the hardcoded label "Takeaway". Checkout.jsx's delivery flow
// always sends order_type: 'delivery' (see buildOrderPayload()), so
// every delivery order placed through the storefront was silently
// mislabeled as a takeaway order in the admin Order Management screen
// — with no visual distinction and no way to tell it apart from a real
// takeaway order (or notice it needed a delivery address / rider) just
// by looking at this table. This is a *display* bug only; the order's
// real order_type in the database was always correct — see
// DeliveryManagement.jsx and the dashboard's delivery queue, which
// query order_type === 'delivery' directly and were never affected.
const ORDER_TYPE_META = {
  'dine-in': {
    icon: <LuUtensilsCrossed size={13} />,
    chip: 'bg-[#E4F0E7] text-[#2F6844] border-[#C7E0CD]',
    label: (order) => order.table?.name ?? 'Dine-in',
  },
  'delivery': {
    icon: <LuBike size={13} />,
    chip: 'bg-[#F5E5DE] text-[#9C4A2E] border-[#EAD0C2]',
    label: () => 'Delivery',
  },
  'takeaway': {
    icon: <LuShoppingBag size={13} />,
    chip: 'bg-[#FBEDD9] text-[#8A5A12] border-[#F1D9AE]',
    label: () => 'Takeaway',
  },
};
const getOrderTypeMeta = (orderType) => ORDER_TYPE_META[orderType] ?? ORDER_TYPE_META['takeaway'];

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

const ManageOrders = () => {
  const { searchTerm = '' } = useOutletContext() || {};
  const { orders, loading, error, fetchOrders, advanceStatus, removeOrder } = useOrder();

  const [activeFilter, setActiveFilter] = useState('all');
  const [viewing, setViewing]           = useState(null);
  const [deleting, setDeleting]         = useState(null);
  const [submitting, setSubmitting]     = useState(false);
  const [currentPage, setCurrentPage]   = useState(1);

  // ✅ FIX: global per-status counts for the filter tabs, fetched from
  // OrderController::stats() (GET /admin/orders/stats → by_status),
  // which aggregates over ALL orders in the database.
  //
  // ROOT CAUSE OF THE BUG THIS FIXES: the tab counts used to be derived
  // with `orders.reduce(...)` over the `orders` array from useOrder(),
  // but that array only ever holds ONE PAGE of results — useOrder's
  // fetchOrders() calls orderService.getAll(params) with no per_page
  // override, so the backend's default paginate($request->per_page ??
  // 15) caps it at 15 rows. The dashboard's "Needs your attention"
  // banner, by contrast, gets its pending count from
  // DashboardController::stats() (a true `Order::whereIn(...)->count()`
  // over the whole table) — so the two screens could show different
  // numbers for the exact same thing (e.g. dashboard: "5 orders stuck
  // in pending", this page's tab: "PENDING 1") purely because this
  // page was quietly counting a 15-row subset and calling it the total.
  const [statusCounts, setStatusCounts] = useState({});

  const fetchStatusCounts = useCallback(async () => {
    try {
      const stats = await orderService.getStats();
      const byStatus = stats?.by_status ?? [];
      const map = byStatus.reduce((acc, row) => ({ ...acc, [row.status]: row.count }), {});
      setStatusCounts(map);
    } catch (err) {
      console.error('Failed to fetch order status counts:', err.response ?? err);
    }
  }, []);

  useEffect(() => { fetchStatusCounts(); }, [fetchStatusCounts]);

  // Keep tab counts in sync whenever the order list itself refreshes
  // (poll / Echo / manual refresh) — useOrder() already re-triggers on
  // all of those, so piggyback on `orders` changing rather than adding
  // a second independent poll/Echo subscription here.
  useEffect(() => { fetchStatusCounts(); }, [orders, fetchStatusCounts]);

  const filtered = orders.filter(o => {
    const matchesStatus = activeFilter === 'all' || o.status === activeFilter;
    const searchVal = searchTerm.toLowerCase();
    const matchesSearch =
      String(o.id).includes(searchVal) ||
      (o.user?.name ?? '').toLowerCase().includes(searchVal);
    return matchesStatus && matchesSearch;
  });

  const totalPages  = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const pagedOrders = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  useEffect(() => { setCurrentPage(1); }, [activeFilter, searchTerm]);

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
      <div className="w-8 h-8 border-4 border-[#E8E3D8] border-t-[#1E2A2E] rounded-full animate-spin" />
      <p className="text-xs font-black uppercase tracking-widest text-[#9AA0A0]">Loading orders...</p>
    </div>
  );

  if (error) return (
    <div className="p-8 text-center text-[#B5453B] font-bold text-xs uppercase tracking-wider">
      {error}
      <button
        onClick={() => fetchOrders()}
        className="ml-3 underline text-[#5B6B6F] hover:text-[#1E2A2E] cursor-pointer"
      >
        Retry
      </button>
    </div>
  );

  return (
    <div className="p-6 md:p-8 min-h-screen space-y-6" style={{ background: PAGE_BG }}>

      {/* ── HEADER & REFRESH ── */}
      <div className={`${CARD} p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4`}>
        <div>
          <h1 style={FONT_SERIF} className="text-[16px] font-semibold text-[#1E2A2E]">Order Management</h1>
          <p className="text-xs text-[#8B9296] font-semibold mt-0.5">Track and manage incoming food orders seamlessly from kitchen to payment</p>
        </div>
        <button
          onClick={() => { fetchOrders(); fetchStatusCounts(); }}
          className="bg-white border border-[#E8E3D8] text-[#5B6B6F] px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-[#FBF9F5] transition cursor-pointer shadow-sm flex items-center gap-2"
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
                  ? 'bg-[#1E2A2E] text-white border-[#1E2A2E]'
                  : 'bg-white border-[#E8E3D8] text-[#5B6B6F] hover:bg-[#FBF9F5]'
              }`}
            >
              {f}
              {f !== 'all' && statusCounts[f] > 0 && (
                <span className={`ml-1.5 px-1.5 py-0.5 rounded text-[10px] ${isActive ? 'bg-white/20 text-white' : 'bg-[#F1EFE9] text-[#5B6B6F]'}`}>
                  {statusCounts[f]}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── TABLE CONTAINER ── */}
      <div className={`${CARD} overflow-hidden`}>
        <table className="w-full text-left border-collapse">
          <thead className="bg-[#FBF9F5] text-[#8B9296] text-[11px] font-black uppercase tracking-wider border-b border-[#EFEBE2]">
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
          <tbody className="divide-y divide-[#EFEBE2]">
            {pagedOrders.map(order => {
              const typeMeta = getOrderTypeMeta(order.order_type);
              return (
              <tr
                key={order.id}
                className="hover:bg-[#FBF9F5] transition-colors"
              >
                <td className="px-5 py-3.5 font-black text-xs text-[#C4C0B4]">
                  #{order.id}
                </td>
                <td className="px-5 py-3.5 font-bold text-xs text-[#1E2A2E]">
                  {order.customer_name ?? order.user?.name ?? '—'}
                </td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded-lg border shadow-2xs ${typeMeta.chip}`}>
                      {typeMeta.icon}
                    </div>
                    <span className="font-bold text-xs text-[#3A4548]">
                      {typeMeta.label(order)}
                    </span>
                  </div>
                </td>
                <td className="px-5 py-3.5 font-black text-xs text-[#2F6844]">
                  ${Number(order.total_amount).toFixed(2)}
                </td>
                <td className="px-5 py-3.5">
                  <span className={`text-[10px] font-black px-2.5 py-1 rounded-md border uppercase tracking-widest ${STATUS_STYLES[order.status] ?? 'bg-[#F1EFE9] text-[#8B9296] border-[#E3DFD3]'}`}>
                    {order.status}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-[#8B9296] text-xs font-medium">
                  {order.created_at?.slice(0, 16).replace('T', ' ')}
                </td>
                <td className="px-5 py-3.5">
                  <div className="flex justify-center items-center gap-1.5">
                    <button
                      onClick={() => setViewing(order)}
                      className="p-2 bg-white border border-[#E8E3D8] hover:bg-[#FBF9F5] text-[#5B6B6F] rounded-lg cursor-pointer transition shadow-2xs"
                      title="View details"
                    >
                      <LuEye size={13} />
                    </button>

                    {STATUS_FLOW.includes(order.status) && STATUS_FLOW.indexOf(order.status) < STATUS_FLOW.length - 1 && (
                      <button
                        onClick={() => handleAdvance(order.id)}
                        className="px-2.5 py-1.5 bg-[#1E2A2E] hover:bg-[#2A3B3F] text-white rounded-lg text-[10px] font-black uppercase tracking-wider transition cursor-pointer shadow-2xs flex items-center gap-1"
                        title={`Advance to ${STATUS_FLOW[STATUS_FLOW.indexOf(order.status) + 1]}`}
                      >
                        <span>Advance</span>
                        <LuArrowRight size={11} />
                      </button>
                    )}

                    {order.status === 'served' && (
                      <span className="px-2 py-1 bg-[#FBEDD9] text-[#8A5A12] border border-[#F1D9AE] rounded-lg text-[9px] font-black uppercase tracking-wider">
                        Awaiting Payment
                      </span>
                    )}

                    <button
                      onClick={() => setDeleting(order)}
                      className="p-2 bg-white border border-[#EBC7C1] hover:bg-[#F5E1DE] text-[#B5453B] rounded-lg cursor-pointer transition shadow-2xs"
                      title="Delete order"
                    >
                      <LuTrash2 size={13} />
                    </button>
                  </div>
                </td>
              </tr>
              );
            })}

            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center py-12 text-[#9AA0A0] font-bold text-xs uppercase tracking-wider">
                  {searchTerm ? `No orders match "${searchTerm}"` : 'No orders found matching your criteria.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* ── PAGINATION ── */}
        {totalPages > 1 && (
          <div className="p-3 flex justify-center items-center gap-1.5 border-t border-[#EFEBE2] bg-[#FBF9F5]">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 h-8 rounded-lg font-bold text-xs transition cursor-pointer border border-[#E8E3D8] bg-white text-[#5B6B6F] hover:bg-[#F3F0E9] disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Prev
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
              Next
            </button>
          </div>
        )}
      </div>

      {/* ── VIEW DETAILS MODAL ── */}
      {viewing && (
        <Modal onClose={() => setViewing(null)}>
          <div className="flex items-center justify-between pb-3 border-b border-[#EFEBE2]">
            <h2 className="text-xs font-black uppercase text-[#1E2A2E] tracking-wider">
              Order Details #{viewing.id}
            </h2>
            <button
              onClick={() => setViewing(null)}
              className="text-[#9AA0A0] hover:text-[#1E2A2E] cursor-pointer"
            >
              <LuX size={16} />
            </button>
          </div>

          <div className="space-y-3 pt-4 text-xs">
            <div className="grid grid-cols-2 gap-3 bg-[#FBF9F5] p-3 rounded-lg border border-[#E8E3D8]">
              <div>
                <span className="text-[10px] font-black uppercase text-[#9AA0A0] block mb-0.5">Customer</span>
                <span className="font-bold text-[#1E2A2E]">{viewing.customer_name ?? viewing.user?.name ?? '—'}</span>
              </div>
              <div>
                <span className="text-[10px] font-black uppercase text-[#9AA0A0] block mb-0.5">Order Type</span>
                <span className="font-bold text-[#1E2A2E]">
                  {getOrderTypeMeta(viewing.order_type).label(viewing)}
                </span>
              </div>
              {viewing.order_type === 'delivery' && viewing.delivery_address && (
                <div className="col-span-2">
                  <span className="text-[10px] font-black uppercase text-[#9AA0A0] block mb-0.5">Delivery Address</span>
                  <span className="font-bold text-[#1E2A2E]">{viewing.delivery_address}</span>
                </div>
              )}
              <div>
                <span className="text-[10px] font-black uppercase text-[#9AA0A0] block mb-0.5">Status</span>
                <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider border ${STATUS_STYLES[viewing.status]}`}>
                  {viewing.status}
                </span>
              </div>
              <div>
                <span className="text-[10px] font-black uppercase text-[#9AA0A0] block mb-0.5">Placed At</span>
                <span className="font-bold text-[#5B6B6F]">{viewing.created_at?.slice(0, 16).replace('T', ' ')}</span>
              </div>
            </div>

            {viewing.items?.length > 0 && (
              <div>
                <span className="block text-[10px] font-black uppercase text-[#9AA0A0] mb-2">
                  Ordered Items ({viewing.items.length})
                </span>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {viewing.items.map(item => (
                    <div
                      key={item.id}
                      className="flex justify-between items-center bg-[#FBF9F5] p-2.5 rounded-lg border border-[#E8E3D8] text-xs font-bold"
                    >
                      <div>
                        <span className="text-[#1E2A2E] block">{item.product?.name ?? `Product #${item.product_id}`}</span>
                        {item.note && (
                          <span className="text-[#8A5A12] font-semibold text-[10px] mt-0.5 block">
                            Note: {item.note}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-right">
                        <span className="text-[#9AA0A0]">× {item.quantity}</span>
                        <span className="text-[#2F6844]">${Number(item.subtotal).toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between items-center mt-3 pt-3 border-t border-[#EFEBE2]">
                  <span className="text-[10px] font-black uppercase text-[#8B9296]">Total Amount</span>
                  <span className="text-base font-black text-[#2F6844]">
                    ${Number(viewing.total_amount).toFixed(2)}
                  </span>
                </div>
              </div>
            )}

            {viewing.notes && (
              <div className="bg-[#FBEDD9] p-3 rounded-lg border border-[#F1D9AE] text-xs">
                <span className="font-black text-[#8A5A12] uppercase tracking-wider text-[10px] block mb-1">
                  Order Special Note
                </span>
                <p className="text-[#5C3D0C] font-semibold">{viewing.notes}</p>
              </div>
            )}
          </div>

          <button
            onClick={() => setViewing(null)}
            className="mt-4 w-full bg-[#1E2A2E] hover:bg-[#2A3B3F] text-white py-2.5 rounded-lg text-xs font-black uppercase tracking-wider transition cursor-pointer shadow-sm"
          >
            Close
          </button>
        </Modal>
      )}

      {/* ── DELETE CONFIRMATION MODAL ── */}
      {deleting && (
        <Modal onClose={() => setDeleting(null)}>
          <div className="flex items-center justify-between pb-3 border-b border-[#EFEBE2]">
            <h2 className="text-xs font-black uppercase text-[#1E2A2E] tracking-wider">Delete Order</h2>
            <button
              onClick={() => setDeleting(null)}
              className="text-[#9AA0A0] hover:text-[#1E2A2E] cursor-pointer"
            >
              <LuX size={16} />
            </button>
          </div>

          <div className="py-4 space-y-3 text-xs">
            <p className="text-[#3A4548] font-bold">
              Are you sure you want to delete <span className="font-black text-[#1E2A2E]">Order #{deleting.id}</span>?
            </p>
            <div className="p-3 bg-[#F5E1DE] border border-[#EBC7C1] rounded-lg text-[#8C3327] font-semibold">
              ⚠️ Stock will be restored automatically. This action cannot be undone.
            </div>
          </div>

          <div className="flex gap-2.5 pt-2">
            <button
              onClick={() => setDeleting(null)}
              className="flex-1 py-2.5 border border-[#E8E3D8] rounded-lg font-bold text-xs uppercase tracking-wider hover:bg-[#FBF9F5] cursor-pointer text-[#5B6B6F] transition"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={submitting}
              className="flex-1 py-2.5 bg-[#B5453B] text-white rounded-lg font-bold text-xs uppercase tracking-wider hover:bg-[#9C3B32] cursor-pointer transition shadow-sm disabled:opacity-50"
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