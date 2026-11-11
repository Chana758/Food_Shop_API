import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getImageUrl as buildImageUrl } from '../../utils/imageUrl';
import {
  FaHistory, FaMapMarkerAlt, FaChevronDown, FaChevronUp,
  FaShoppingBag, FaArrowLeft, FaUser, FaSpinner,
} from 'react-icons/fa';
import { MdOutlineReceiptLong } from 'react-icons/md';
import axiosInstance from '../../api/axios';
import { useTranslation } from 'react-i18next';

const OrderHistory = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const [orders, setOrders]           = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);
  const [expandedOrders, setExpanded] = useState([]);
  const [filterStatus, setFilter]     = useState('all');

  // Fetch orders from API 
  useEffect(() => {
    const user = sessionStorage.getItem('user') || sessionStorage.getItem('currentUser');
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
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [navigate]);

  // Helpers 
  const FALLBACK_IMG = 'https://placehold.co/400x300?text=Khmer+Fresh';
  const getImageUrl = (p) => buildImageUrl(p, FALLBACK_IMG);

  const formatDate = (str) =>
    new Date(str).toLocaleDateString(i18n.language === 'kh' ? 'km-KH' : 'en-US', {
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
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    items.forEach(item => {
      const idx = cart.findIndex(c => c.id === item.product_id && c.type === 'product');
      if (idx > -1) {
        cart[idx].quantity += item.quantity;
      } else {
        cart.push({
          id:       item.product_id,
          name:     item.product?.name,
          price:    item.price,
          quantity: item.quantity,
          image:    item.product?.image,
          type:     'product',
        });
      }
    });
    localStorage.setItem('cart', JSON.stringify(cart));
    window.dispatchEvent(new Event('cartUpdated'));
    navigate('/cart');
  };

  // Filtered list─────
  const filtered = filterStatus === 'all'
    ? orders
    : orders.filter(o => o.status === filterStatus);

  // Loading 
  if (loading) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center">
        <FaSpinner className="animate-spin text-[#2D4A22] text-3xl" />
      </div>
    );
  }

  // Error
  if (error) {
    return (
      <div className="w-full min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-red-400 font-bold uppercase text-sm">{t('orderHistory.loadFailed')}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-[#2D4A22] text-white text-[10px] font-black uppercase tracking-widest"
        >
          {t('error.retry')}
        </button>
      </div>
    );
  }

  // Empty
  if (orders.length === 0) {
    return (
      <div className="w-full min-h-screen bg-[#FDFDFD] pt-40 pb-20 px-6 flex flex-col items-center justify-center text-center">
        <div className="w-24 h-24 bg-gray-50 border border-gray-100 flex items-center justify-center mb-8">
          <FaHistory className="text-3xl text-gray-200" />
        </div>
        <h2 className="text-2xl font-black text-[#2D4A22] uppercase tracking-tighter mb-4">{t('orderHistory.noOrders')}</h2>
        <button
          onClick={() => navigate('/menu')}
          className="px-10 py-4 bg-[#2D4A22] text-white font-black text-[11px] uppercase tracking-[0.3em] hover:bg-[#F58220] transition-all"
        >
          {t('cart.browseMenu')}
        </button>
      </div>
    );
  }

  // Main rende
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
              <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" /> {t('common.back')}
            </button>
            <h1 className="text-4xl font-black text-[#2D4A22] uppercase tracking-tighter">
              {t('orderHistory.titleA')} <span className="text-[#F58220]">{t('orderHistory.titleB')}</span>
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
                {t(`status.${s}`)}
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
                        {t(`orderType.${order.order_type}`, order.order_type)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 ml-auto sm:ml-0">
                    {/* Delivery status badge */}
                    {isDelivery && order.delivery_status && (
                      <span className={`px-3 py-1 text-[8px] font-black uppercase tracking-widest rounded-full
                        ${getDeliveryStatusStyle(order.delivery_status)}`}>
                        {t(`deliveryStatus.${order.delivery_status}`, order.delivery_status.replace(/_/g, ' '))}
                      </span>
                    )}
                    <div className="text-right">
                      <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{t('checkout.total')}</p>
                      <p className="text-sm font-black text-[#2D4A22]">${Number(order.total_amount).toFixed(2)}</p>
                    </div>
                    <span className={`px-4 py-1.5 text-[9px] font-black uppercase tracking-[0.2em] border ${getStatusStyle(order.status)}`}>
                      {t(`status.${order.status}`, order.status)}
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
                        <MdOutlineReceiptLong className="text-[#F58220]" /> {t('orderHistory.orderedItems')}
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
                                  onError={e => { e.target.onerror = null; e.target.src = FALLBACK_IMG; }}
                                />
                              </div>
                              <div>
                                <p className="text-[10px] font-black text-[#2D4A22] uppercase">
                                  {item.product?.name ?? '—'}
                                </p>
                                <p className="text-[9px] font-bold text-gray-400">{t('checkout.qty')}: {item.quantity}</p>
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
                                <span>{t('orderHistory.rider')}: {order.rider.name} · {order.rider.phone}</span>
                              </div>
                            )}
                          </>
                        )}

                        {/* Notes */}
                        {order.notes && (
                          <div className="flex gap-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest italic">
                            <span>{t('orderHistory.note')}: {order.notes}</span>
                          </div>
                        )}

                        {/* Totals */}
                        <div className="pt-3 border-t border-gray-200 space-y-1">
                          <div className="flex justify-between text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                            <span>{t('orderHistory.orderType')}</span>
                            <span className="text-[#2D4A22]">{t(`orderType.${order.order_type}`, order.order_type)}</span>
                          </div>
                          <div className="flex justify-between text-[10px] font-black text-[#2D4A22] uppercase tracking-widest pt-1">
                            <span>{t('checkout.total')}</span>
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
                          {t('orderHistory.reorderItems')}
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