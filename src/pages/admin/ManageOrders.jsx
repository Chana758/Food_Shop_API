import React, { useState } from 'react';
import { LuEye, LuX, LuArrowRight, LuUtensilsCrossed, LuShoppingBag } from 'react-icons/lu';

// Maps directly to orders.status: pending -> cooking -> served -> paid
const STATUS_FLOW = ['pending', 'cooking', 'served', 'paid'];
const STATUS_STYLES = {
  pending: 'bg-orange-50 text-orange-600 border-orange-100',
  cooking: 'bg-blue-50 text-blue-600 border-blue-100',
  served: 'bg-purple-50 text-purple-600 border-purple-100',
  paid: 'bg-green-50 text-green-700 border-green-100',
};

// Dummy data shaped like the `orders` table (+ joined user/table names for display)
const INITIAL_ORDERS = [
  { id: 'ORD-1001', customer: 'Vy Za', order_type: 'dine-in', table_name: 'Table 03', total_amount: 12.0, status: 'served', notes: '', created_at: '2026-06-19 11:02' },
  { id: 'ORD-1002', customer: 'Sam Channa', order_type: 'takeaway', table_name: null, total_amount: 8.5, status: 'pending', notes: 'No chili, extra rice', created_at: '2026-06-19 11:08' },
  { id: 'ORD-1003', customer: 'Dara Pich', order_type: 'dine-in', table_name: 'Table 01', total_amount: 21.5, status: 'cooking', notes: '', created_at: '2026-06-19 11:15' },
  { id: 'ORD-1004', customer: 'Sokha Lim', order_type: 'dine-in', table_name: 'Table 07', total_amount: 15.0, status: 'paid', notes: 'Birthday — add candle', created_at: '2026-06-19 10:40' },
];

const FILTERS = ['All', ...STATUS_FLOW];

const ManageOrders = () => {
  const [orders, setOrders] = useState(INITIAL_ORDERS);
  const [activeFilter, setActiveFilter] = useState('All');
  const [viewing, setViewing] = useState(null);

  const filtered = activeFilter === 'All' ? orders : orders.filter((o) => o.status === activeFilter);

  const advanceStatus = (id) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id !== id) return o;
        const next = STATUS_FLOW[STATUS_FLOW.indexOf(o.status) + 1];
        return next ? { ...o, status: next } : o;
      })
    );
  };

  const counts = orders.reduce((acc, o) => ({ ...acc, [o.status]: (acc[o.status] || 0) + 1 }), {});

  return (
    <div className="p-8 bg-[#FDFDFD] min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-black text-[#1a2e35] uppercase tracking-tight">Order Management</h1>
        <p className="text-xs text-gray-400 font-black uppercase tracking-widest mt-1">
          Track orders from kitchen to payment
        </p>
      </div>

      {/* Status filter tabs */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className={`px-4 py-2 rounded-sm text-xs font-black uppercase tracking-widest whitespace-nowrap transition-colors ${
              activeFilter === f
                ? 'bg-[#1c2e35] text-[#ffcc33]'
                : 'bg-white border border-gray-100 text-gray-400 hover:text-[#1a2e35]'
            }`}
          >
            {f} {f !== 'All' && <span className="ml-1 text-gray-400">({counts[f] || 0})</span>}
          </button>
        ))}
      </div>

      {/* Orders table */}
      <div className="bg-white rounded-sm border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-[#1c2e35] text-white text-[11px] font-black uppercase tracking-wider">
            <tr>
              <th className="p-4">Order ID</th>
              <th className="p-4">Customer</th>
              <th className="p-4">Type</th>
              <th className="p-4">Total</th>
              <th className="p-4">Status</th>
              <th className="p-4">Placed</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="text-sm font-bold text-gray-600">
            {filtered.map((order) => (
              <tr key={order.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                <td className="p-4 font-mono text-gray-500">{order.id}</td>
                <td className="p-4 text-[#1a2e35]">{order.customer}</td>
                <td className="p-4">
                  <div className="flex items-center gap-2 text-gray-600 font-medium">
                    {order.order_type === 'dine-in' ? (
                      <LuUtensilsCrossed size={14} className="text-[#4ade80]" />
                    ) : (
                      <LuShoppingBag size={14} className="text-[#ffcc33]" />
                    )}
                    {order.order_type === 'dine-in' ? order.table_name : 'Takeaway'}
                  </div>
                </td>
                <td className="p-4 text-[#2D4A22] font-black">${order.total_amount.toFixed(2)}</td>
                <td className="p-4">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${STATUS_STYLES[order.status]}`}>
                    {order.status}
                  </span>
                </td>
                <td className="p-4 text-gray-400 font-medium text-xs">{order.created_at}</td>
                <td className="p-4">
                  <div className="flex items-center justify-end gap-3">
                    <button onClick={() => setViewing(order)} className="text-gray-300 hover:text-[#1a2e35] transition-colors">
                      <LuEye size={16} />
                    </button>
                    {order.status !== 'paid' && (
                      <button
                        onClick={() => advanceStatus(order.id)}
                        className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-[#1a2e35] transition-colors"
                      >
                        Advance <LuArrowRight size={12} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="p-10 text-center text-gray-300 text-xs font-black uppercase tracking-widest">
                  No orders in this status
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Order detail dialog */}
      {viewing && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setViewing(null)}>
          <div className="bg-white rounded-sm p-8 w-[26rem]" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-black text-[#1a2e35] uppercase">{viewing.id}</h2>
              <button onClick={() => setViewing(null)} className="text-gray-400 hover:text-[#1a2e35]">
                <LuX size={20} />
              </button>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400 font-bold uppercase text-xs tracking-widest">Customer</span>
                <span className="font-bold text-[#1a2e35]">{viewing.customer}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400 font-bold uppercase text-xs tracking-widest">Type</span>
                <span className="font-bold text-[#1a2e35]">
                  {viewing.order_type === 'dine-in' ? viewing.table_name : 'Takeaway'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400 font-bold uppercase text-xs tracking-widest">Total</span>
                <span className="font-black text-[#2D4A22]">${viewing.total_amount.toFixed(2)}</span>
              </div>
              <div className="pt-3 border-t border-gray-50">
                <span className="text-gray-400 font-bold uppercase text-xs tracking-widest block mb-1">Notes</span>
                <p className="text-gray-600 font-medium">{viewing.notes || '—'}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageOrders;