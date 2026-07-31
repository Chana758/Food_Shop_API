import React, { useState, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  LuBike, LuMapPin, LuPhone, LuUser, LuRefreshCw,
  LuCircleCheck, LuCircleX, LuClock, LuPackage,
  LuCircleAlert, LuChevronDown
} from 'react-icons/lu';
import axiosInstance from '../../api/axios';

// ── Status config ──────────────────────────────────────────
const DELIVERY_STATUSES = [
  { value: 'unassigned', label: 'Unassigned', color: 'bg-slate-200 text-slate-800 border-slate-300', icon: <LuClock size={13} /> },
  { value: 'assigned',   label: 'Assigned',   color: 'bg-blue-200 text-blue-900 border-blue-300',   icon: <LuBike size={13} /> },
  { value: 'picked_up',  label: 'Picked Up',  color: 'bg-amber-200 text-amber-900 border-amber-300', icon: <LuPackage size={13} /> },
  { value: 'on_the_way', label: 'On the Way', color: 'bg-orange-200 text-orange-900 border-orange-300', icon: <LuMapPin size={13} /> },
  { value: 'delivered',  label: 'Delivered',  color: 'bg-emerald-200 text-emerald-900 border-emerald-300', icon: <LuCircleCheck size={13} /> },
  { value: 'failed',     label: 'Failed',     color: 'bg-rose-200 text-rose-900 border-rose-300',     icon: <LuCircleX size={13} /> },
];

const statusMeta = Object.fromEntries(DELIVERY_STATUSES.map(s => [s.value, s]));

// ──────────────────────────────────────────────────────────
const DeliveryManagement = () => {
  const { searchTerm: search } = useOutletContext() ?? { searchTerm: '' };

  const [orders,  setOrders]  = useState([]);
  const [riders,  setRiders]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter,  setFilter]  = useState('all');
  const [timeTab, setTimeTab] = useState('Daily');

  // Modal state
  const [assignModal, setAssignModal] = useState(null);
  const [statusModal, setStatusModal] = useState(null);
  const [selectedRider,  setSelectedRider]  = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  // ── Fetch ──────────────────────────────────────────────
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

  // ── Toast helper ───────────────────────────────────────
  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // ── Assign rider ───────────────────────────────────────
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

  // ── Update delivery status ─────────────────────────────
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

  // ── Filtered orders ────────────────────────────────────
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

  // ── Summary counts ─────────────────────────────────────
  const counts = DELIVERY_STATUSES.reduce((acc, s) => {
    acc[s.value] = orders.filter(o => o.delivery_status === s.value).length;
    return acc;
  }, {});

  const totalDeliveryOrders = orders.length;
  const deliveredCount = counts['delivered'] || 0;
  const activeDeliveriesCount = (counts['assigned'] || 0) + (counts['picked_up'] || 0) + (counts['on_the_way'] || 0);
  const unassignedCount = counts['unassigned'] || 0;
  const completionRate = totalDeliveryOrders > 0 ? Math.round((deliveredCount / totalDeliveryOrders) * 100) : 0;

  // ──────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#F5F3EC] p-6 space-y-6 font-sans text-stone-900">

      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-[9999] px-5 py-3 rounded-xl shadow-xl text-sm font-bold text-white transition-all ${toast.type === 'error' ? 'bg-rose-600' : 'bg-emerald-700'}`}>
          {toast.msg}
        </div>
      )}

      {/* ── SECTION 1: Delivery Performance Report ── */}
      <div className="bg-white rounded-2xl border-2 border-stone-300 p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-base font-black tracking-tight uppercase text-stone-900">Delivery Performance Report</h1>
            <p className="text-xs font-semibold text-stone-500 mt-0.5">Daily, monthly, and yearly delivery metrics with actionable data</p>
          </div>
          {/* Time Tabs */}
          <div className="flex bg-stone-100 p-1 rounded-xl border border-stone-300">
            {['Daily', 'Monthly', 'Yearly'].map(tab => (
              <button
                key={tab}
                onClick={() => setTimeTab(tab)}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${timeTab === tab ? 'bg-emerald-800 text-white shadow-xs' : 'text-stone-600 hover:text-stone-900'}`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Top 5 Metrics Cards (Đិតជាងមុន) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          
          {/* Card 1: Total */}
          <div className="bg-[#FAF8F5] rounded-xl border-2 border-stone-300 p-4 relative overflow-hidden">
            <div className="flex justify-between items-start mb-2">
              <span className="p-2 bg-emerald-100 text-emerald-800 rounded-lg"><LuPackage size={16} /></span>
              <span className="text-[10px] font-black uppercase text-stone-400 tracking-wider">Total</span>
            </div>
            <p className="text-xs font-bold text-stone-500 uppercase">Delivery Orders</p>
            <p className="text-2xl font-black text-stone-900 mt-1">{totalDeliveryOrders}</p>
            <span className="text-[10px] font-bold text-emerald-700 mt-2 inline-block">Active tracking</span>
          </div>

          {/* Card 2: Success / Delivered */}
          <div className="bg-[#FAF8F5] rounded-xl border-2 border-stone-300 p-4 relative overflow-hidden">
            <div className="flex justify-between items-start mb-2">
              <span className="p-2 bg-blue-100 text-blue-800 rounded-lg"><LuCircleCheck size={16} /></span>
              <span className="text-[10px] font-black uppercase text-stone-400 tracking-wider">Success</span>
            </div>
            <p className="text-xs font-bold text-stone-500 uppercase">Delivered</p>
            <p className="text-2xl font-black text-stone-900 mt-1">{deliveredCount}</p>
            <span className="text-[10px] font-bold text-blue-700 mt-2 inline-block">Completed successfully</span>
          </div>

          {/* Card 3: Active Deliveries */}
          <div className="bg-[#FAF8F5] rounded-xl border-2 border-stone-300 p-4 relative overflow-hidden">
            <div className="flex justify-between items-start mb-2">
              <span className="p-2 bg-orange-100 text-orange-800 rounded-lg"><LuBike size={16} /></span>
              <span className="text-[10px] font-black uppercase text-stone-400 tracking-wider">Live</span>
            </div>
            <p className="text-xs font-bold text-stone-500 uppercase">Active Deliveries</p>
            <p className="text-2xl font-black text-stone-900 mt-1">{activeDeliveriesCount}</p>
            <span className="text-[10px] font-bold text-orange-700 mt-2 inline-block">In progress</span>
          </div>

          {/* Card 4: Unassigned */}
          <div className="bg-[#FAF8F5] rounded-xl border-2 border-stone-300 p-4 relative overflow-hidden">
            <div className="flex justify-between items-start mb-2">
              <span className="p-2 bg-stone-200 text-stone-800 rounded-lg"><LuClock size={16} /></span>
              <span className="text-[10px] font-black uppercase text-stone-400 tracking-wider">Pending</span>
            </div>
            <p className="text-xs font-bold text-stone-500 uppercase">Unassigned</p>
            <p className="text-2xl font-black text-stone-900 mt-1">{unassignedCount}</p>
            <span className="text-[10px] font-bold text-stone-600 mt-2 inline-block">Requires rider</span>
          </div>

          {/* Card 5: Completion Rate */}
          <div className="bg-[#FAF8F5] rounded-xl border-2 border-stone-300 p-4 relative overflow-hidden">
            <div className="flex justify-between items-start mb-2">
              <span className="p-2 bg-purple-100 text-purple-800 rounded-lg"><LuMapPin size={16} /></span>
              <span className="text-[10px] font-black uppercase text-stone-400 tracking-wider">Performance</span>
            </div>
            <p className="text-xs font-bold text-stone-500 uppercase">Completion Rate</p>
            <p className="text-2xl font-black text-stone-900 mt-1">{completionRate}%</p>
            <span className="text-[10px] font-bold text-purple-700 mt-2 inline-block">Overall efficiency</span>
          </div>

        </div>
      </div>

      {/* ── SECTION 2: Delivery Status Overview & Quick Actions ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Delivery Status Overview (6 Cards តូចៗ) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border-2 border-stone-300 p-5 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b-2 border-stone-200 pb-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-600 inline-block"></span>
              <h2 className="text-xs font-black uppercase tracking-wider text-stone-900">Delivery Status Overview</h2>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-stone-100 border border-stone-300 px-2.5 py-1 rounded-lg text-stone-700">Live Filter</span>
          </div>

          {/* 6 Grid Status Items */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {DELIVERY_STATUSES.map(s => {
              const isSelected = filter === s.value;
              return (
                <div
                  key={s.value}
                  onClick={() => setFilter(isSelected ? 'all' : s.value)}
                  className={`bg-[#FAF8F5] rounded-xl border-2 p-3.5 transition-all cursor-pointer flex flex-col justify-between hover:border-stone-500
                    ${isSelected ? 'border-stone-900 bg-stone-200/60 ring-2 ring-stone-900/20' : 'border-stone-300'}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-black uppercase border ${s.color}`}>
                      {s.icon} {s.label}
                    </span>
                  </div>
                  <p className="text-2xl font-black text-stone-900 tracking-tight">{counts[s.value] ?? 0}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Quick Actions & Filters */}
        <div className="lg:col-span-5 bg-white rounded-2xl border-2 border-stone-300 p-5 space-y-4 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between border-b-2 border-stone-200 pb-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block"></span>
              <h2 className="text-xs font-black uppercase tracking-wider text-stone-900">Quick Actions & Filters</h2>
            </div>
            <button onClick={fetchData} className="p-1.5 bg-stone-100 hover:bg-stone-200 border border-stone-300 rounded-lg text-stone-700 cursor-pointer" title="Refresh">
              <LuRefreshCw size={14} />
            </button>
          </div>

          <div className="space-y-3 py-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-stone-500 block">Filter:</span>
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer border ${filter === 'all' ? 'bg-stone-900 text-white border-stone-900' : 'bg-stone-100 text-stone-700 border-stone-300 hover:bg-stone-200'}`}
              >
                All
              </button>
              {DELIVERY_STATUSES.map(s => (
                <button
                  key={s.value}
                  onClick={() => setFilter(s.value)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer border ${filter === s.value ? 'bg-stone-900 text-white border-stone-900' : 'bg-stone-100 text-stone-700 border-stone-300 hover:bg-stone-200'}`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-[#FAF8F5] rounded-xl p-3 border border-stone-300 text-[11px] font-semibold text-stone-600 flex items-center justify-between">
            <span>Showing filtered active database view</span>
            <span className="font-black text-emerald-800">{filteredOrders.length} orders</span>
          </div>
        </div>

      </div>

      {/* ── SECTION 3: All Delivery Orders Table ── */}
      <div className="bg-white rounded-2xl border-2 border-stone-300 overflow-hidden shadow-xs">
        <div className="px-6 py-4 border-b-2 border-stone-200 flex items-center justify-between bg-[#FAF8F5]">
          <h2 className="text-xs font-black text-stone-900 uppercase tracking-widest flex items-center gap-2">
            All Delivery Orders
            <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-900 border border-emerald-300 text-[10px]">
              {filteredOrders.length}
            </span>
          </h2>
          {filter !== 'all' && (
            <button onClick={() => setFilter('all')} className="text-[10px] font-black text-stone-500 hover:text-stone-900 uppercase tracking-widest cursor-pointer">
              Clear Filter ×
            </button>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20 text-stone-500 font-bold text-xs uppercase tracking-widest gap-2">
            <LuRefreshCw className="animate-spin" size={16} /> Loading database records...
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-stone-400 space-y-2">
            <LuBike size={40} />
            <p className="text-xs font-black uppercase tracking-widest text-stone-500">No delivery orders found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[10px] font-black text-stone-500 uppercase tracking-widest border-b-2 border-stone-200 bg-stone-100">
                  <th className="px-6 py-3.5 text-left">Order</th>
                  <th className="px-6 py-3.5 text-left">Customer</th>
                  <th className="px-6 py-3.5 text-left">Address</th>
                  <th className="px-6 py-3.5 text-left">Rider</th>
                  <th className="px-6 py-3.5 text-left">Status</th>
                  <th className="px-6 py-3.5 text-left">Total</th>
                  <th className="px-6 py-3.5 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200">
                {filteredOrders.map(order => {
                  const meta   = statusMeta[order.delivery_status] ?? statusMeta['unassigned'];
                  const rider  = order.rider;
                  const isDone = ['delivered', 'failed'].includes(order.delivery_status);

                  return (
                    <tr key={order.id} className="hover:bg-stone-50 transition-colors">
                      <td className="px-6 py-4">
                        <span className="font-black text-stone-900">#{order.id}</span>
                        <p className="text-[10px] text-stone-500 mt-0.5 font-semibold">
                          {new Date(order.created_at).toLocaleDateString('en-GB', {
                            day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
                          })}
                        </p>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-xs font-black text-stone-900">
                          <LuUser size={13} className="text-stone-500" />
                          {order.customer_name ?? order.user?.name ?? '—'}
                        </div>
                        {order.customer_phone && (
                          <div className="flex items-center gap-1.5 text-[10px] text-stone-500 mt-0.5 font-bold">
                            <LuPhone size={11} />
                            {order.customer_phone}
                          </div>
                        )}
                      </td>

                      <td className="px-6 py-4 max-w-[200px]">
                        <div className="flex items-start gap-1.5 text-[11px] text-stone-800 font-bold leading-snug">
                          <LuMapPin size={13} className="text-orange-600 mt-0.5 flex-shrink-0" />
                          {order.delivery_address ?? '—'}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        {rider ? (
                          <div>
                            <p className="text-xs font-black text-stone-900">{rider.name}</p>
                            <p className="text-[10px] text-stone-500 font-bold">{rider.phone}</p>
                          </div>
                        ) : (
                          <span className="text-[10px] font-black text-stone-400 uppercase tracking-wider">No rider</span>
                        )}
                      </td>

                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase border-2 ${meta.color}`}>
                          {meta.icon} {meta.label}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <span className="font-black text-stone-900">
                          ${Number(order.total_amount).toFixed(2)}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {!isDone && (
                            <button
                              onClick={() => { setAssignModal({ order }); setSelectedRider(order.rider_id ?? ''); }}
                              className="px-3 py-1.5 rounded-lg bg-blue-100 text-blue-900 border border-blue-300 text-[10px] font-black uppercase hover:bg-blue-200 transition-all cursor-pointer"
                            >
                              {rider ? 'Re-assign' : 'Assign Rider'}
                            </button>
                          )}

                          {!isDone && (
                            <button
                              onClick={() => { setStatusModal({ order }); setSelectedStatus(order.delivery_status ?? ''); }}
                              className="px-3 py-1.5 rounded-lg bg-orange-100 text-orange-900 border border-orange-300 text-[10px] font-black uppercase hover:bg-orange-200 transition-all flex items-center gap-1 cursor-pointer"
                            >
                              Update <LuChevronDown size={11} />
                            </button>
                          )}

                          {isDone && (
                            <span className="text-[10px] font-black text-stone-500 uppercase tracking-wider bg-stone-100 px-2 py-1 rounded border border-stone-300">
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
      </div>

      {/* Assign Rider Modal */}
      {assignModal && (
        <ModalOverlay onClose={() => setAssignModal(null)}>
          <h3 className="text-base font-black text-stone-900 tracking-tight mb-1">
            Assign Rider — Order #{assignModal.order.id}
          </h3>
          <p className="text-[11px] text-stone-500 uppercase mb-5 font-bold">
            {assignModal.order.customer_name} · {assignModal.order.delivery_address}
          </p>

          <label className="text-[10px] font-black text-stone-600 uppercase tracking-wider mb-2 block">
            Select Rider
          </label>
          <select
            value={selectedRider}
            onChange={e => setSelectedRider(e.target.value)}
            className="w-full border-2 border-stone-300 rounded-xl px-4 py-3 text-xs font-bold text-stone-900 focus:border-stone-900 outline-none mb-6 bg-stone-50"
          >
            <option value="">— Choose a rider —</option>
            {riders.map(r => (
              <option key={r.id} value={r.id} disabled={r.status === 'busy'}>
                {r.name} ({r.phone}){r.status === 'busy' ? ' — Busy' : ''}
              </option>
            ))}
          </select>

          {riders.length === 0 && (
            <div className="flex items-center gap-2 text-amber-800 text-xs font-bold mb-4 bg-amber-100 p-3 rounded-lg border border-amber-300">
              <LuCircleAlert size={14} /> No available riders registered.
            </div>
          )}

          <div className="flex gap-3">
            <button onClick={() => setAssignModal(null)} className="flex-1 py-3 rounded-xl border-2 border-stone-300 text-xs font-black text-stone-700 hover:bg-stone-100 transition-all cursor-pointer uppercase">
              Cancel
            </button>
            <button onClick={handleAssignRider} disabled={!selectedRider || submitting} className="flex-1 py-3 rounded-xl bg-stone-900 text-white text-xs font-black uppercase tracking-wide hover:bg-stone-800 transition-all disabled:opacity-40 cursor-pointer shadow-xs">
              {submitting ? 'Assigning...' : 'Assign'}
            </button>
          </div>
        </ModalOverlay>
      )}

      {/* Update Delivery Status Modal */}
      {statusModal && (
        <ModalOverlay onClose={() => setStatusModal(null)}>
          <h3 className="text-base font-black text-stone-900 tracking-tight mb-1">
            Update Status — Order #{statusModal.order.id}
          </h3>
          <p className="text-[11px] text-stone-500 uppercase mb-5 font-bold">
            Rider: {statusModal.order.rider?.name ?? 'Unassigned'}
          </p>

          <label className="text-[10px] font-black text-stone-600 uppercase tracking-wider mb-3 block">
            Delivery Status
          </label>
          <div className="space-y-2 mb-6">
            {DELIVERY_STATUSES.map(s => (
              <label
                key={s.value}
                className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all
                  ${selectedStatus === s.value ? 'border-stone-900 bg-stone-200/80 ring-1 ring-stone-900/30' : 'border-stone-300 hover:border-stone-400 bg-stone-50'}`}
              >
                <input
                  type="radio" name="delivery_status" value={s.value}
                  checked={selectedStatus === s.value}
                  onChange={() => setSelectedStatus(s.value)}
                  className="accent-stone-900 w-4 h-4"
                />
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase border-2 ${s.color}`}>
                  {s.icon} {s.label}
                </span>
              </label>
            ))}
          </div>

          <div className="flex gap-3">
            <button onClick={() => setStatusModal(null)} className="flex-1 py-3 rounded-xl border-2 border-stone-300 text-xs font-black text-stone-700 hover:bg-stone-100 transition-all cursor-pointer uppercase">
              Cancel
            </button>
            <button onClick={handleUpdateStatus} disabled={!selectedStatus || submitting} className="flex-1 py-3 rounded-xl bg-stone-900 text-white text-xs font-black uppercase tracking-wide hover:bg-stone-800 transition-all disabled:opacity-40 cursor-pointer shadow-xs">
              {submitting ? 'Updating...' : 'Update'}
            </button>
          </div>
        </ModalOverlay>
      )}
    </div>
  );
};

const ModalOverlay = ({ children, onClose }) => (
  <div className="fixed inset-0 z-[9998] flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-xs">
    <div className="bg-[#FAF8F5] w-full max-w-md rounded-2xl shadow-2xl p-7 relative border-2 border-stone-300">
      <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-stone-200 text-stone-600 font-black transition-all cursor-pointer">
        ✕
      </button>
      {children}
    </div>
  </div>
);

export default DeliveryManagement;