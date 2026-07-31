import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaHistory, FaMapMarkerAlt, FaChevronDown, FaChevronUp,
  FaShoppingBag, FaArrowLeft, FaUser, FaSpinner,
} from 'react-icons/fa';
import { MdOutlineReceiptLong } from 'react-icons/md';
import axiosInstance from '../../api/axios';

const OrderHistory = () => {
  const navigate = useNavigate();

  const [orders, setOrders]           = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);
  const [expandedOrders, setExpanded] = useState([]);
  const [filterStatus, setFilter]     = useState('all');

  // ── Fetch orders from API ──────────────────────────────
  useEffect(() => {
    const user = localStorage.getItem('user') || localStorage.getItem('currentUser');
    if (!user) { navigate('/login'); return; }

    const fetchOrders = async () => {
      try {
        setLoading(true);
        // GET /api/orders — returns current user's orders only
        const res = await axiosInstance.get('/orders');
        const data = res.data?.data;

        // Handle both paginated { data: [...] } and plain array
        const list = Array.isArray(data) ? data : (data?.data ?? []);
        setOrders(list);
      } catch (err) {
        console.error('Failed to fetch orders:', err.response ?? err);
        setError('Failed to load order history.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [navigate]);

  // ── Helpers ───────────────────────────────────────────
  const getImageUrl = (p) =>
    !p ? '/placeholder-food.jpg'
      : p.startsWith('http') ? p
      : `http://127.0.0.1:8000/storage/${p}`;

  const formatDate = (str) =>
    new Date(str).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });

  const toggleExpand = (id) =>
    setExpanded(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const getStatusStyle = (status) => {
    const map = {
      pending:   'text-yellow-600 bg-yellow-50 border-yellow-100',
      cooking:   'text-orange-600 bg-orange-50 border-orange-100',
      served:    'text-blue-600 bg-blue-50 border-blue-100',
      paid:      'text-green-600 bg-green-50 border-green-100',
      cancelled: 'text-red-600 bg-red-50 border-red-100',
      delivered: 'text-green-600 bg-green-50 border-green-100',
    };
    return map[status] ?? 'text-gray-600 bg-gray-50 border-gray-100';
  };

  const getDeliveryStatusStyle = (status) => {
    const map = {
      unassigned: 'text-gray-500 bg-gray-50',
      assigned:   'text-blue-600 bg-blue-50',
      picked_up:  'text-yellow-600 bg-yellow-50',
      on_the_way: 'text-orange-600 bg-orange-50',
      delivered:  'text-green-600 bg-green-50',
      failed:     'text-red-600 bg-red-50',
    };
    return map[status] ?? 'text-gray-500 bg-gray-50';
  };

  const handleReorder = (items) => {
    const currentCart = JSON.parse(localStorage.getItem('cart') || '[]');
    const newItems = items.map(item => ({
      id:       item.product_id,
      name:     item.product?.name,
      price:    item.price,
      quantity: item.quantity,
      image:    item.product?.image,
      type:     'food',
    }));
    localStorage.setItem('cart', JSON.stringify([...currentCart, ...newItems]));
    window.dispatchEvent(new Event('cartUpdated'));
    navigate('/cart');
  };

  // ── Filtered list ─────────────────────────────────────
  const filtered = filterStatus === 'all'
    ? orders
    : orders.filter(o => o.status === filterStatus);

  // ── Loading ───────────────────────────────────────────
  if (loading) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center">
        <FaSpinner className="animate-spin text-[#2D4A22] text-3xl" />
      </div>
    );
  }

  // ── Error ─────────────────────────────────────────────
  if (error) {
    return (
      <div className="w-full min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-red-400 font-bold uppercase text-sm">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-[#2D4A22] text-white text-[10px] font-black uppercase tracking-widest"
        >
          Retry
        </button>
      </div>
    );
  }

  // ── Empty ─────────────────────────────────────────────
  if (orders.length === 0) {
    return (
      <div className="w-full min-h-screen bg-[#FDFDFD] pt-40 pb-20 px-6 flex flex-col items-center justify-center text-center">
        <div className="w-24 h-24 bg-gray-50 border border-gray-100 flex items-center justify-center mb-8">
          <FaHistory className="text-3xl text-gray-200" />
        </div>
        <h2 className="text-2xl font-black text-[#2D4A22] uppercase tracking-tighter mb-4">No History Yet</h2>
        <button
          onClick={() => navigate('/MenuFood')}
          className="px-10 py-4 bg-[#2D4A22] text-white font-black text-[11px] uppercase tracking-[0.3em] hover:bg-[#F58220] transition-all"
        >
          Browse Menu
        </button>
      </div>
    );
  }

  // ── Main render ───────────────────────────────────────
  return (
    <div className="w-full min-h-screen bg-[#FDFDFD] pt-32 pb-20 px-6 md:px-14">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="mb-12 border-b border-gray-100 pb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-[#2D4A22] font-black text-[10px] uppercase tracking-[0.3em] hover:text-[#F58220] transition-colors mb-6 group"
            >
              <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" /> Back
            </button>
            <h1 className="text-4xl font-black text-[#2D4A22] uppercase tracking-tighter">
              Order <span className="text-[#F58220]">History</span>
            </h1>
          </div>

          {/* Filter tabs */}
          <div className="flex gap-2 p-1 bg-gray-50 border border-gray-100 rounded-sm">
            {['all', 'pending', 'paid', 'cancelled'].map(s => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`px-4 py-2 text-[9px] font-black uppercase tracking-widest transition-all
                  ${filterStatus === s ? 'bg-white text-[#2D4A22] shadow-sm' : 'text-gray-400 hover:text-[#2D4A22]'}`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Orders list */}
        <div className="space-y-6">
          {filtered.map(order => {
            const isExpanded = expandedOrders.includes(order.id);
            const isDelivery = order.order_type === 'delivery';

            return (
              <div key={order.id} className="bg-white border border-gray-100 rounded-sm overflow-hidden hover:shadow-md transition-shadow">

                {/* Row header */}
                <div
                  className={`p-6 cursor-pointer flex flex-wrap items-center justify-between gap-6 transition-colors
                    ${isExpanded ? 'bg-gray-50' : 'hover:bg-gray-50/50'}`}
                  onClick={() => toggleExpand(order.id)}
                >
                  <div className="flex items-center gap-6">
                    <div className="hidden sm:flex w-14 h-14 bg-white border border-gray-100 items-center justify-center text-[#2D4A22]">
                      <FaShoppingBag size={20} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-[#F58220] uppercase tracking-widest mb-1">
                        #{order.id}
                      </p>
                      <h3 className="text-sm font-black text-[#2D4A22] uppercase tracking-tight">
                        {formatDate(order.created_at)}
                      </h3>
                      <p className="text-[9px] font-bold text-gray-400 uppercase mt-0.5">
                        {order.order_type}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 ml-auto sm:ml-0">
                    {/* Delivery status badge */}
                    {isDelivery && order.delivery_status && (
                      <span className={`px-3 py-1 text-[8px] font-black uppercase tracking-widest rounded-full
                        ${getDeliveryStatusStyle(order.delivery_status)}`}>
                        {order.delivery_status.replace('_', ' ')}
                      </span>
                    )}
                    <div className="text-right">
                      <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Total</p>
                      <p className="text-sm font-black text-[#2D4A22]">${Number(order.total_amount).toFixed(2)}</p>
                    </div>
                    <span className={`px-4 py-1.5 text-[9px] font-black uppercase tracking-[0.2em] border ${getStatusStyle(order.status)}`}>
                      {order.status}
                    </span>
                    {isExpanded ? <FaChevronUp className="text-gray-300" /> : <FaChevronDown className="text-gray-300" />}
                  </div>
                </div>

                {/* Expanded detail */}
                {isExpanded && (
                  <div className="border-t border-gray-100 p-8 grid lg:grid-cols-2 gap-12">

                    {/* Items */}
                    <div>
                      <h4 className="text-[10px] font-black text-[#2D4A22] uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                        <MdOutlineReceiptLong className="text-[#F58220]" /> Items
                      </h4>
                      <div className="space-y-4">
                        {(order.items ?? []).map((item, idx) => (
                          <div key={idx} className="flex justify-between items-center">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 overflow-hidden border border-gray-100 flex-shrink-0">
                                <img
                                  src={getImageUrl(item.product?.image)}
                                  alt={item.product?.name}
                                  className="w-full h-full object-cover"
                                  onError={e => { e.target.src = '/placeholder-food.jpg'; }}
                                />
                              </div>
                              <div>
                                <p className="text-[10px] font-black text-[#2D4A22] uppercase">
                                  {item.product?.name ?? '—'}
                                </p>
                                <p className="text-[9px] font-bold text-gray-400">Qty: {item.quantity}</p>
                              </div>
                            </div>
                            <span className="text-xs font-black text-[#2D4A22]">
                              ${Number(item.subtotal).toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Info + Reorder */}
                    <div className="space-y-6">
                      <div className="bg-gray-50 p-5 space-y-3">
                        {/* Customer info (delivery orders) */}
                        {isDelivery && (
                          <>
                            {order.customer_name && (
                              <div className="flex gap-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                                <FaUser size={10} className="mt-0.5 flex-shrink-0" />
                                <span>{order.customer_name}</span>
                              </div>
                            )}
                            {order.delivery_address && (
                              <div className="flex gap-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                                <FaMapMarkerAlt size={10} className="mt-0.5 flex-shrink-0" />
                                <span>{order.delivery_address}</span>
                              </div>
                            )}
                            {order.rider && (
                              <div className="flex gap-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                                <span className="text-[#F58220]">🛵</span>
                                <span>Rider: {order.rider.name} · {order.rider.phone}</span>
                              </div>
                            )}
                          </>
                        )}

                        {/* Notes */}
                        {order.notes && (
                          <div className="flex gap-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest italic">
                            <span>Note: {order.notes}</span>
                          </div>
                        )}

                        {/* Totals */}
                        <div className="pt-3 border-t border-gray-200 space-y-1">
                          <div className="flex justify-between text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                            <span>Order Type</span>
                            <span className="text-[#2D4A22]">{order.order_type}</span>
                          </div>
                          <div className="flex justify-between text-[10px] font-black text-[#2D4A22] uppercase tracking-widest pt-1">
                            <span>Total</span>
                            <span>${Number(order.total_amount).toFixed(2)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Reorder button */}
                      {order.items?.length > 0 && (
                        <button
                          onClick={() => handleReorder(order.items)}
                          className="w-full py-4 bg-[#2D4A22] text-white text-[9px] font-black uppercase tracking-[0.3em] hover:bg-[#F58220] transition-colors shadow-lg"
                        >
                          Reorder These Items
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default OrderHistory;