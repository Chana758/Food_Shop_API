import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  LuBike, LuMapPin, LuPhone, LuUser, LuRefreshCw,
  LuCircleCheck, LuCircleX, LuClock, LuPackage,
  LuCircleAlert, LuChevronDown, LuChevronLeft, LuChevronRight
} from 'react-icons/lu';
import axiosInstance from '../../api/axios';

const PAGE_SIZE = 8;

/*
  Palette matched to the Khmer-Fresh admin (see Dashboard / Contacts):
  Ink #1E2A2E · Gold #D99A3D · Herb #3F7D58 · Sky #3B6E91 · Plum #7A4F6D · Chili #B5453B
  Status colors below reuse the same light-pill hues as the dashboard's
  DELIVERY_STATUS_STYLES, so a "picked up" tag looks identical whether it's
  seen here or on the dashboard's live delivery queue.
*/
const FONT_SERIF = { fontFamily: "'Fraunces', Georgia, serif" };
const CARD = "bg-white rounded-2xl border border-[#E8E3D8] shadow-[0_1px_3px_rgba(30,42,46,0.05)]";
const PAGE_BG = "var(--page-bg)";

// Status config 
const DELIVERY_STATUSES = [
  { value: 'unassigned', label: 'Unassigned', color: 'bg-[#F1EFE9] text-[#6B6259] border-[#E3DFD3]', icon: <LuClock size={13} /> },
  { value: 'assigned',   label: 'Assigned',   color: 'bg-[#E3EDF3] text-[#2E5975] border-[#C9DCE8]', icon: <LuBike size={13} /> },
  { value: 'picked_up',  label: 'Picked Up',  color: 'bg-[#FBEDD9] text-[#8A5A12] border-[#F1D9AE]', icon: <LuPackage size={13} /> },
  { value: 'on_the_way', label: 'On the Way', color: 'bg-[#F5E5DE] text-[#9C4A2E] border-[#EAD0C2]', icon: <LuMapPin size={13} /> },
  { value: 'delivered',  label: 'Delivered',  color: 'bg-[#E4F0E7] text-[#2F6844] border-[#C7E0CD]', icon: <LuCircleCheck size={13} /> },
  { value: 'failed',     label: 'Failed',     color: 'bg-[#F5E1DE] text-[#8C3327] border-[#EBC7C1]', icon: <LuCircleX size={13} /> },
];

const statusMeta = Object.fromEntries(DELIVERY_STATUSES.map(s => [s.value, s]));

// Solid fills for the 6-card "Delivery Status Overview" grid — same bold
// treatment as the dashboard's live delivery queue chips, so this panel
// and the dashboard read as the same component in two places.
const DELIVERY_FILL = {
  unassigned: 'bg-[#B5453B]',
  assigned:   'bg-[#3B6E91]',
  picked_up:  'bg-[#D99A3D]',
  on_the_way: 'bg-[#C1653D]',
  delivered:  'bg-[#3F7D58]',
  failed:     'bg-[#8C3327]',
};

// Bold solid fills for the 5 report cards — same treatment as the
// dashboard/contacts stat cards. Unassigned reads as urgent (chili)
// since it needs a rider; the rest use calm ink/herb/sky/plum tones.
const STAT_FILL = {
  ink:   { bg: 'bg-[#1E2A2E]', chip: 'bg-white/10 text-[#E8C97A]', badge: 'bg-white/10 text-white/80', sub: 'text-[#B9C2C4]' },
  herb:  { bg: 'bg-[#3F7D58]', chip: 'bg-white/20 text-white',     badge: 'bg-white/20 text-white',     sub: 'text-[#CFE7D7]' },
  sky:   { bg: 'bg-[#3B6E91]', chip: 'bg-white/20 text-white',     badge: 'bg-white/20 text-white',     sub: 'text-[#CFE1EC]' },
  chili: { bg: 'bg-[#B5453B]', chip: 'bg-white/20 text-white',     badge: 'bg-white/20 text-white',     sub: 'text-[#F3D4D0]' },
  plum:  { bg: 'bg-[#7A4F6D]', chip: 'bg-white/20 text-white',     badge: 'bg-white/20 text-white',     sub: 'text-[#E3D3DE]' },
};

const ReportStatCard = ({ icon, fill, badge, title, value, sub }) => {
  const f = STAT_FILL[fill];
  return (
    <div className={`${f.bg} rounded-xl p-4 flex flex-col justify-between shadow-[0_4px_14px_rgba(30,42,46,0.12)]`}>
      <div className="flex items-start justify-between mb-2">
        <span className={`${f.chip} p-2 rounded-lg`}>{icon}</span>
        <span className={`${f.badge} text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full`}>{badge}</span>
      </div>
      <p className="text-white/80 text-xs font-bold uppercase">{title}</p>
      <p className="text-2xl font-black text-white mt-1">{value}</p>
      {sub && <span className={`${f.sub} text-[10px] font-bold mt-2 inline-block`}>{sub}</span>}
    </div>
  );
};


const DeliveryManagement = () => {
  const { searchTerm: search } = useOutletContext() ?? { searchTerm: '' };

  const [orders,  setOrders]  = useState([]);
  const [riders,  setRiders]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter,  setFilter]  = useState('all');
  const [timeTab, setTimeTab] = useState('Daily');
  const [currentPage, setCurrentPage] = useState(1);

  // Modal state
  const [assignModal, setAssignModal] = useState(null);
  const [statusModal, setStatusModal] = useState(null);
  const [selectedRider,  setSelectedRider]  = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  // Fetch 
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [ordersRes, ridersRes] = await Promise.all([
        axiosInstance.get('/admin/orders', {
          params: { order_type: 'delivery', per_page: 50 },
        }),
        axiosInstance.get('/admin/riders'),
      ]);
      setOrders(ordersRes.data.data?.data ?? ordersRes.data.data ?? []);
      setRiders(ridersRes.data.data ?? []);
    } catch (err) {
      console.error('DeliveryManagement fetch error:', err);
      showToast('Failed to load delivery data.', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Reset to page 1 whenever the filter or search term changes
  useEffect(() => { setCurrentPage(1); }, [filter, search]);

  // Toast helper
  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  //  Assign rider 
  const handleAssignRider = async () => {
    if (!selectedRider) return;
    setSubmitting(true);
    try {
      await axiosInstance.put(`/admin/orders/${assignModal.order.id}/assign-rider`, {
        rider_id: selectedRider,
      });
      showToast('Rider assigned successfully.');
      setAssignModal(null);
      setSelectedRider('');
      fetchData();
    } catch (err) {
      showToast(err.response?.data?.message ?? 'Failed to assign rider.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Update delivery status
  const handleUpdateStatus = async () => {
    if (!selectedStatus) return;
    setSubmitting(true);
    try {
      await axiosInstance.put(`/admin/orders/${statusModal.order.id}/delivery-status`, {
        delivery_status: selectedStatus,
      });
      showToast('Delivery status updated.');
      setStatusModal(null);
      setSelectedStatus('');
      fetchData();
    } catch (err) {
      showToast(err.response?.data?.message ?? 'Failed to update status.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Filtered orders 
  const filteredOrders = orders.filter(o => {
    const matchStatus = filter === 'all' || o.delivery_status === filter;
    const matchSearch = !search ||
      String(o.id).toLowerCase().includes(search.toLowerCase()) ||
      o.customer_name?.toLowerCase().includes(search.toLowerCase()) ||
      o.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
      o.delivery_address?.toLowerCase().includes(search.toLowerCase()) ||
      o.rider?.name?.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  // Summary counts 
  const counts = DELIVERY_STATUSES.reduce((acc, s) => {
    acc[s.value] = orders.filter(o => o.delivery_status === s.value).length;
    return acc;
  }, {});

  const totalDeliveryOrders = orders.length;
  const deliveredCount = counts['delivered'] || 0;
  const activeDeliveriesCount = (counts['assigned'] || 0) + (counts['picked_up'] || 0) + (counts['on_the_way'] || 0);
  const unassignedCount = counts['unassigned'] || 0;
  const completionRate = totalDeliveryOrders > 0 ? Math.round((deliveredCount / totalDeliveryOrders) * 100) : 0;

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedOrders = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    return filteredOrders.slice(start, start + PAGE_SIZE);
  }, [filteredOrders, safePage]);

  //   
  return (
    <div className="min-h-screen p-6 space-y-6 font-sans text-[#1E2A2E]" style={{ background: PAGE_BG }}>

      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-[9999] px-5 py-3 rounded-xl shadow-xl text-sm font-bold text-white transition-all ${toast.type === 'error' ? 'bg-[#B5453B]' : 'bg-[#3F7D58]'}`}>
          {toast.msg}
        </div>
      )}

      {/* ── SECTION 1: Delivery Performance Report ── */}
      <div className={`${CARD} p-6 space-y-5`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 style={FONT_SERIF} className="text-[16px] font-semibold text-[#1E2A2E]">Delivery performance report</h1>
            <p className="text-xs font-semibold text-[#8B9296] mt-0.5">Daily, monthly, and yearly delivery metrics with actionable data</p>
          </div>
          {/* Time Tabs */}
          <div className="flex bg-[#FBF9F5] p-1 rounded-xl border border-[#E8E3D8]">
            {['Daily', 'Monthly', 'Yearly'].map(tab => (
              <button
                key={tab}
                onClick={() => setTimeTab(tab)}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${timeTab === tab ? 'bg-[#1E2A2E] text-white shadow-xs' : 'text-[#5B6B6F] hover:text-[#1E2A2E]'}`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Top 5 Metrics Cards — bold solid fills, same family as the
            dashboard/contacts stat cards. */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <ReportStatCard
            icon={<LuPackage size={16} />}
            fill="ink"
            badge="Total"
            title="Delivery Orders"
            value={totalDeliveryOrders}
            sub="Active tracking"
          />
          <ReportStatCard
            icon={<LuCircleCheck size={16} />}
            fill="herb"
            badge="Success"
            title="Delivered"
            value={deliveredCount}
            sub="Completed successfully"
          />
          <ReportStatCard
            icon={<LuBike size={16} />}
            fill="sky"
            badge="Live"
            title="Active Deliveries"
            value={activeDeliveriesCount}
            sub="In progress"
          />
          <ReportStatCard
            icon={<LuClock size={16} />}
            fill="chili"
            badge="Pending"
            title="Unassigned"
            value={unassignedCount}
            sub="Requires rider"
          />
          <ReportStatCard
            icon={<LuMapPin size={16} />}
            fill="plum"
            badge="Performance"
            title="Completion Rate"
            value={`${completionRate}%`}
            sub="Overall efficiency"
          />
        </div>
      </div>

      {/* ── SECTION 2: Delivery Status Overview & Quick Actions ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Left: Delivery Status Overview (6 small cards) */}
        <div className={`lg:col-span-7 ${CARD} p-5 space-y-4`}>
          <div className="flex items-center justify-between border-b border-[#EFEBE2] pb-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#C1653D] inline-block"></span>
              <h2 className="text-xs font-black uppercase tracking-wider text-[#1E2A2E]">Delivery Status Overview</h2>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-[#FBF9F5] border border-[#E8E3D8] px-2.5 py-1 rounded-lg text-[#5B6B6F]">Live Filter</span>
          </div>

          {/* 6 Grid Status Items — solid color blocks (white icon badge,
              big white number) instead of a cream card with a light pill,
              matching the dashboard's live delivery queue chips. */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {DELIVERY_STATUSES.map(s => {
              const isSelected = filter === s.value;
              return (
                <div
                  key={s.value}
                  onClick={() => setFilter(isSelected ? 'all' : s.value)}
                  className={`${DELIVERY_FILL[s.value]} rounded-xl p-3.5 transition-all cursor-pointer flex flex-col justify-between shadow-[0_4px_14px_rgba(30,42,46,0.12)]
                    ${isSelected ? 'ring-2 ring-white ring-offset-2 ring-offset-[#FBF9F5]' : ''}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-black uppercase bg-white/20 text-white">
                      {s.icon} {s.label}
                    </span>
                  </div>
                  <p className="text-2xl font-black text-white tracking-tight">{counts[s.value] ?? 0}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Quick Actions & Filters */}
        <div className={`lg:col-span-5 ${CARD} p-5 space-y-4 flex flex-col justify-between`}>
          <div className="flex items-center justify-between border-b border-[#EFEBE2] pb-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#3F7D58] inline-block"></span>
              <h2 className="text-xs font-black uppercase tracking-wider text-[#1E2A2E]">Quick Actions & Filters</h2>
            </div>
            <button onClick={fetchData} className="p-1.5 bg-[#FBF9F5] hover:bg-[#F3F0E9] border border-[#E8E3D8] rounded-lg text-[#5B6B6F] cursor-pointer" title="Refresh">
              <LuRefreshCw size={14} />
            </button>
          </div>

          <div className="space-y-3 py-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-[#8B9296] block">Filter:</span>
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer border ${filter === 'all' ? 'bg-[#1E2A2E] text-white border-[#1E2A2E]' : 'bg-[#FBF9F5] text-[#5B6B6F] border-[#E8E3D8] hover:bg-[#F3F0E9]'}`}
              >
                All
              </button>
              {DELIVERY_STATUSES.map(s => (
                <button
                  key={s.value}
                  onClick={() => setFilter(s.value)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer border ${filter === s.value ? 'bg-[#1E2A2E] text-white border-[#1E2A2E]' : 'bg-[#FBF9F5] text-[#5B6B6F] border-[#E8E3D8] hover:bg-[#F3F0E9]'}`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-[#FBF9F5] rounded-xl p-3 border border-[#E8E3D8] text-[11px] font-semibold text-[#5B6B6F] flex items-center justify-between">
            <span>Showing filtered active database view</span>
            <span className="font-black text-[#2F6844]">{filteredOrders.length} orders</span>
          </div>
        </div>

      </div>

      {/* ── SECTION 3: All Delivery Orders Table ── */}
      <div className={`${CARD} overflow-hidden`}>
        <div className="px-6 py-4 border-b border-[#EFEBE2] flex items-center justify-between bg-[#FBF9F5]">
          <h2 className="text-xs font-black text-[#1E2A2E] uppercase tracking-widest flex items-center gap-2">
            All Delivery Orders
            <span className="px-2 py-0.5 rounded-md bg-[#E4F0E7] text-[#2F6844] border border-[#C7E0CD] text-[10px]">
              {filteredOrders.length}
            </span>
          </h2>
          {filter !== 'all' && (
            <button onClick={() => setFilter('all')} className="text-[10px] font-black text-[#9AA0A0] hover:text-[#1E2A2E] uppercase tracking-widest cursor-pointer">
              Clear Filter ×
            </button>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20 text-[#8B9296] font-bold text-xs uppercase tracking-widest gap-2">
            <LuRefreshCw className="animate-spin" size={16} /> Loading database records...
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-[#C4C0B4] space-y-2">
            <LuBike size={40} />
            <p className="text-xs font-black uppercase tracking-widest text-[#9AA0A0]">No delivery orders found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[10px] font-black text-[#8B9296] uppercase tracking-widest border-b border-[#EFEBE2] bg-[#FBF9F5]">
                  <th className="px-6 py-3.5 text-left">Order</th>
                  <th className="px-6 py-3.5 text-left">Customer</th>
                  <th className="px-6 py-3.5 text-left">Address</th>
                  <th className="px-6 py-3.5 text-left">Rider</th>
                  <th className="px-6 py-3.5 text-left">Status</th>
                  <th className="px-6 py-3.5 text-left">Total</th>
                  <th className="px-6 py-3.5 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EFEBE2]">
                {paginatedOrders.map(order => {
                  const meta   = statusMeta[order.delivery_status] ?? statusMeta['unassigned'];
                  const rider  = order.rider;
                  const isDone = ['delivered', 'failed'].includes(order.delivery_status);

                  return (
                    <tr key={order.id} className="hover:bg-[#FBF9F5] transition-colors">
                      <td className="px-6 py-4">
                        <span className="font-black text-[#1E2A2E]">#{order.id}</span>
                        <p className="text-[10px] text-[#9AA0A0] mt-0.5 font-semibold">
                          {new Date(order.created_at).toLocaleDateString('en-GB', {
                            day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
                          })}
                        </p>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-xs font-black text-[#1E2A2E]">
                          <LuUser size={13} className="text-[#8B9296]" />
                          {order.customer_name ?? order.user?.name ?? '—'}
                        </div>
                        {order.customer_phone && (
                          <div className="flex items-center gap-1.5 text-[10px] text-[#9AA0A0] mt-0.5 font-bold">
                            <LuPhone size={11} />
                            {order.customer_phone}
                          </div>
                        )}
                      </td>

                      <td className="px-6 py-4 max-w-[200px]">
                        <div className="flex items-start gap-1.5 text-[11px] text-[#3A4548] font-bold leading-snug">
                          <LuMapPin size={13} className="text-[#C1653D] mt-0.5 flex-shrink-0" />
                          {order.delivery_address ?? '—'}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        {rider ? (
                          <div>
                            <p className="text-xs font-black text-[#1E2A2E]">{rider.name}</p>
                            <p className="text-[10px] text-[#9AA0A0] font-bold">{rider.phone}</p>
                          </div>
                        ) : (
                          <span className="text-[10px] font-black text-[#C4C0B4] uppercase tracking-wider">No rider</span>
                        )}
                      </td>

                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase border ${meta.color}`}>
                          {meta.icon} {meta.label}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <span className="font-black text-[#1E2A2E]">
                          ${Number(order.total_amount).toFixed(2)}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {!isDone && (
                            <button
                              onClick={() => { setAssignModal({ order }); setSelectedRider(order.rider_id ?? ''); }}
                              className="px-3 py-1.5 rounded-lg bg-[#E3EDF3] text-[#2E5975] border border-[#C9DCE8] text-[10px] font-black uppercase hover:bg-[#D5E3EC] transition-all cursor-pointer"
                            >
                              {rider ? 'Re-assign' : 'Assign Rider'}
                            </button>
                          )}

                          {!isDone && (
                            <button
                              onClick={() => { setStatusModal({ order }); setSelectedStatus(order.delivery_status ?? ''); }}
                              className="px-3 py-1.5 rounded-lg bg-[#FBEDD9] text-[#8A5A12] border border-[#F1D9AE] text-[10px] font-black uppercase hover:bg-[#F6E2C0] transition-all flex items-center gap-1 cursor-pointer"
                            >
                              Update <LuChevronDown size={11} />
                            </button>
                          )}

                          {isDone && (
                            <span className="text-[10px] font-black text-[#5B6B6F] uppercase tracking-wider bg-[#FBF9F5] px-2 py-1 rounded border border-[#E8E3D8]">
                              {order.delivery_status === 'delivered' ? '✓ Completed' : '✗ Failed'}
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* ── PAGINATION ── */}
        {!loading && filteredOrders.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-6 py-3.5 border-t border-[#EFEBE2] bg-[#FBF9F5]">
            <p className="text-[11px] font-bold text-[#8B9296] uppercase tracking-wider">
              Showing {(safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, filteredOrders.length)} of {filteredOrders.length}
            </p>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={safePage === 1}
                className="p-2 rounded-lg border border-[#E8E3D8] bg-white text-[#5B6B6F] hover:bg-[#F3F0E9] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition"
              >
                <LuChevronLeft size={14} />
              </button>

              {Array.from({ length: totalPages }, (_, idx) => idx + 1)
                .filter((p) => p === 1 || p === totalPages || Math.abs(p - safePage) <= 1)
                .reduce((acc, p, idx, arr) => {
                  if (idx > 0 && p - arr[idx - 1] > 1) acc.push('...');
                  acc.push(p);
                  return acc;
                }, [])
                .map((p, idx) =>
                  p === '...' ? (
                    <span key={`dots-${idx}`} className="px-1.5 text-[#C4C0B4] text-xs font-bold">…</span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => setCurrentPage(p)}
                      className={`min-w-[32px] h-8 px-2 rounded-lg text-xs font-black transition cursor-pointer ${
                        p === safePage
                          ? 'bg-[#1E2A2E] text-white'
                          : 'bg-white border border-[#E8E3D8] text-[#5B6B6F] hover:bg-[#F3F0E9]'
                      }`}
                    >
                      {p}
                    </button>
                  )
                )}

              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={safePage === totalPages}
                className="p-2 rounded-lg border border-[#E8E3D8] bg-white text-[#5B6B6F] hover:bg-[#F3F0E9] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition"
              >
                <LuChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Assign Rider Modal */}
      {assignModal && (
        <ModalOverlay onClose={() => setAssignModal(null)}>
          <h3 className="text-base font-black text-[#1E2A2E] tracking-tight mb-1">
            Assign Rider — Order #{assignModal.order.id}
          </h3>
          <p className="text-[11px] text-[#9AA0A0] uppercase mb-5 font-bold">
            {assignModal.order.customer_name} · {assignModal.order.delivery_address}
          </p>

          <label className="text-[10px] font-black text-[#5B6B6F] uppercase tracking-wider mb-2 block">
            Select Rider
          </label>
          <select
            value={selectedRider}
            onChange={e => setSelectedRider(e.target.value)}
            className="w-full border border-[#E8E3D8] rounded-xl px-4 py-3 text-xs font-bold text-[#1E2A2E] focus:border-[#1E2A2E] outline-none mb-6 bg-[#FBF9F5]"
          >
            <option value="">— Choose a rider —</option>
            {riders.map(r => (
              <option key={r.id} value={r.id} disabled={r.status === 'busy'}>
                {r.name} ({r.phone}){r.status === 'busy' ? ' — Busy' : ''}
              </option>
            ))}
          </select>

          {riders.length === 0 && (
            <div className="flex items-center gap-2 text-[#8A5A12] text-xs font-bold mb-4 bg-[#FBEDD9] p-3 rounded-lg border border-[#F1D9AE]">
              <LuCircleAlert size={14} /> No available riders registered.
            </div>
          )}

          <div className="flex gap-3">
            <button onClick={() => setAssignModal(null)} className="flex-1 py-3 rounded-xl border border-[#E8E3D8] text-xs font-black text-[#5B6B6F] hover:bg-[#FBF9F5] transition-all cursor-pointer uppercase">
              Cancel
            </button>
            <button onClick={handleAssignRider} disabled={!selectedRider || submitting} className="flex-1 py-3 rounded-xl bg-[#1E2A2E] text-white text-xs font-black uppercase tracking-wide hover:bg-[#2A3B3F] transition-all disabled:opacity-40 cursor-pointer shadow-xs">
              {submitting ? 'Assigning...' : 'Assign'}
            </button>
          </div>
        </ModalOverlay>
      )}

      {/* Update Delivery Status Modal */}
      {statusModal && (
        <ModalOverlay onClose={() => setStatusModal(null)}>
          <h3 className="text-base font-black text-[#1E2A2E] tracking-tight mb-1">
            Update Status — Order #{statusModal.order.id}
          </h3>
          <p className="text-[11px] text-[#9AA0A0] uppercase mb-5 font-bold">
            Rider: {statusModal.order.rider?.name ?? 'Unassigned'}
          </p>

          <label className="text-[10px] font-black text-[#5B6B6F] uppercase tracking-wider mb-3 block">
            Delivery Status
          </label>
          <div className="space-y-2 mb-6">
            {DELIVERY_STATUSES.map(s => (
              <label
                key={s.value}
                className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all
                  ${selectedStatus === s.value ? 'border-[#1E2A2E] bg-[#F3F0E9] ring-1 ring-[#1E2A2E]/20' : 'border-[#E8E3D8] hover:border-[#C4C0B4] bg-[#FBF9F5]'}`}
              >
                <input
                  type="radio" name="delivery_status" value={s.value}
                  checked={selectedStatus === s.value}
                  onChange={() => setSelectedStatus(s.value)}
                  className="accent-[#1E2A2E] w-4 h-4"
                />
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase border ${s.color}`}>
                  {s.icon} {s.label}
                </span>
              </label>
            ))}
          </div>

          <div className="flex gap-3">
            <button onClick={() => setStatusModal(null)} className="flex-1 py-3 rounded-xl border border-[#E8E3D8] text-xs font-black text-[#5B6B6F] hover:bg-[#FBF9F5] transition-all cursor-pointer uppercase">
              Cancel
            </button>
            <button onClick={handleUpdateStatus} disabled={!selectedStatus || submitting} className="flex-1 py-3 rounded-xl bg-[#1E2A2E] text-white text-xs font-black uppercase tracking-wide hover:bg-[#2A3B3F] transition-all disabled:opacity-40 cursor-pointer shadow-xs">
              {submitting ? 'Updating...' : 'Update'}
            </button>
          </div>
        </ModalOverlay>
      )}
    </div>
  );
};

const ModalOverlay = ({ children, onClose }) => (
  <div className="fixed inset-0 z-[9998] flex items-center justify-center p-4 bg-[#1E2A2E]/60 backdrop-blur-xs">
    <div className="bg-[#FBF9F5] w-full max-w-md rounded-2xl shadow-2xl p-7 relative border border-[#E8E3D8]">
      <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#F3F0E9] text-[#5B6B6F] font-black transition-all cursor-pointer">
        ✕
      </button>
      {children}
    </div>
  </div>
);

export default DeliveryManagement;