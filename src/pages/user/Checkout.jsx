import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaCreditCard, FaMoneyBillWave, FaArrowLeft,
  FaTimes, FaCheckCircle, FaSpinner, FaExclamationTriangle,
} from 'react-icons/fa';
import { MdOutlineReceiptLong } from 'react-icons/md';
import { QRCodeSVG } from 'qrcode.react';
import axiosInstance from '../../api/axios';
import { generateDynamicKHQR } from '../../utils/khqr';
import { MERCHANT_NAME } from '../../config/khqrConfig';
import BankBadges from '../../components/payment/BankBadges';
import usePricing from '../../hooks/usePricing';

const POLL_INTERVAL_MS   = 4000;
const KHQR_EXPIRY_SECONDS = 180;

const Checkout = () => {
  const navigate = useNavigate();
  const { delivery_fee: DELIVERY_FEE, free_delivery_threshold: FREE_THRESHOLD } = usePricing();

  const [cartItems, setCartItems]         = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [formData, setFormData]           = useState({
    fullName: '', phone: '', address: '',
    city: 'Phnom Penh', notes: '', paymentMethod: 'cash',
  });

  const [errors, setErrors]                     = useState({});
  const [orderError, setOrderError]             = useState(null);
  const [showErrorModal, setShowErrorModal]     = useState(false);
  const [isSubmitting, setIsSubmitting]         = useState(false);

  // ✅ FIX: no more orderId / paymentId / cancelPendingOrder for KHQR —
  // nothing is created server-side until a poll confirms `paid: true`,
  // so there is nothing to track or cancel while waiting.
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [timeLeft, setTimeLeft]                 = useState(KHQR_EXPIRY_SECONDS);
  const [khqrPayload, setKhqrPayload]           = useState(null);
  const [khqrError, setKhqrError]               = useState(false);
  const [khqrErrorMsg, setKhqrErrorMsg]         = useState(null);
  const [generatingQr, setGeneratingQr]         = useState(false);
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);
  const [confirmedOrder, setConfirmedOrder]     = useState(null);

  const isPollingRef = useRef(false); // avoids overlapping poll requests

  // ─── Derived totals ───────────────────────────────────────
  const subtotal = cartItems.reduce((t, i) => t + i.price * i.quantity, 0);
  const delivery = subtotal > 0 ? (subtotal >= FREE_THRESHOLD ? 0 : DELIVERY_FEE) : 0;
  const total    = subtotal + delivery;

  // ─── Build shared order payload (cash + khqr) ──────────────
  const buildOrderPayload = useCallback(() => ({
    order_type:       'delivery',
    customer_name:    formData.fullName,
    customer_phone:   formData.phone,
    delivery_address: `${formData.address}, ${formData.city}`,
    notes:            formData.notes,
    items: cartItems.map(i => ({
      product_id: i.id,
      quantity:   i.quantity,
      note:       '',
    })),
  }), [formData, cartItems]);

  // ─── Load User & Cart (Auto-Fill Profile) ─────────────────
  useEffect(() => {
    const storedUser = sessionStorage.getItem('currentUser') || localStorage.getItem('currentUser') || localStorage.getItem('user');
    if (!storedUser) { navigate('/login'); return; }

    try {
      const user = JSON.parse(storedUser);
      setFormData(prev => ({
        ...prev,
        fullName: user.name || user.full_name || user.fullName || user.username || prev.fullName,
        phone:    user.phone || user.phone_number || user.phoneNumber || prev.phone,
        address:  user.address || prev.address,
        city:     user.city || prev.city || 'Phnom Penh',
      }));
    } catch (err) {
      console.error('Error auto-filling user profile:', err);
    }

    const storedCart     = localStorage.getItem('cart');
    const storedSelected = localStorage.getItem('selectedItems');
    if (!storedCart) { navigate('/cart'); return; }

    const cart     = JSON.parse(storedCart);
    const selected = storedSelected ? JSON.parse(storedSelected) : [];
    const items    = cart.filter(i => selected.includes(`${i.id}-${i.type}`));

    if (items.length === 0) { navigate('/cart'); return; }
    setCartItems(items);
    setSelectedItems(selected);
  }, [navigate]);

  // ─── Countdown timer — just shows "expired" state on timeout.
  //     Nothing to cancel: nothing was ever created. ─────────────
  useEffect(() => {
    if (!showPaymentModal || paymentConfirmed) return;

    const t = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(t);
          setKhqrError(true);
          setKhqrErrorMsg('QR code expired. Please try again.');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(t);
  }, [showPaymentModal, paymentConfirmed]);

  // ─── Poll /orders/khqr every 4s — the ONLY place an Order/Payment
  //     is ever created for this flow, and only once Bakong confirms
  //     the money actually arrived (amount-verified server-side). ────
  useEffect(() => {
    if (!showPaymentModal || !khqrPayload || paymentConfirmed || khqrError) return;

    const poll = async () => {
      if (isPollingRef.current) return;
      isPollingRef.current = true;
      try {
        const res = await axiosInstance.post('/orders/khqr', {
          ...buildOrderPayload(),
          transaction_ref: khqrPayload.md5,
        });

        if (res.data?.paid) {
          setPaymentConfirmed(true);
          setConfirmedOrder(res.data.data);
        }
        // paid === false → keep waiting, DB untouched
      } catch (err) {
        console.error('KHQR poll error:', err.response ?? err);
      } finally {
        isPollingRef.current = false;
      }
    };

    poll();
    const interval = setInterval(poll, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [showPaymentModal, khqrPayload, paymentConfirmed, khqrError, buildOrderPayload]);

  // ─── Auto-redirect once payment confirmed ─────────────────
  useEffect(() => {
    if (!paymentConfirmed || !confirmedOrder) return;
    const t = setTimeout(() => clearCartAndRedirect(confirmedOrder), 1200);
    return () => clearTimeout(t);
  }, [paymentConfirmed, confirmedOrder]); // eslint-disable-line

  // ─── Shared cart cleanup + redirect ───────────────────────
  const clearCartAndRedirect = (order) => {
    const currentCart = JSON.parse(localStorage.getItem('cart') || '[]');
    localStorage.setItem(
      'cart',
      JSON.stringify(currentCart.filter(i => !selectedItems.includes(`${i.id}-${i.type}`)))
    );
    localStorage.removeItem('selectedItems');
    window.dispatchEvent(new Event('cartUpdated'));
    setShowPaymentModal(false);
    navigate('/order-success', {
      state: {
        order: {
          id: order.id, items: cartItems, customerInfo: formData,
          subtotal, delivery, total, date: new Date().toISOString(),
        },
      },
    });
  };

  const showError = (msg) => {
    setOrderError(msg);
    setShowErrorModal(true);
  };

  // ✅ FIX: closing is now purely client-side — nothing exists in the DB
  // to cancel, so this can never leave a ghost/orphan order behind,
  // regardless of how fast the customer clicks X.
  const handleCloseModal = () => {
    setShowPaymentModal(false);
    setKhqrPayload(null);
    setKhqrError(false);
    setKhqrErrorMsg(null);
  };

  // ─── KHQR flow — generates QR client-side only. No backend call
  //     happens here at all; polling (above) is what talks to the API. ──
  const openPaymentModal = useCallback(() => {
    setGeneratingQr(true);
    setKhqrError(false);
    setKhqrErrorMsg(null);
    setPaymentConfirmed(false);
    setConfirmedOrder(null);
    setTimeLeft(KHQR_EXPIRY_SECONDS);
    setShowPaymentModal(true);

    const result = generateDynamicKHQR({ amount: total, billNumber: `KF-${Date.now()}` });
    if (!result) {
      setKhqrError(true);
      setKhqrErrorMsg('Failed to generate QR code.');
      setGeneratingQr(false);
      return;
    }
    setKhqrPayload(result);
    setGeneratingQr(false);
  }, [total]);

  const handleRetryKhqr = () => openPaymentModal();

  // ─── Cash flow (unchanged) — cash is legitimately "pending" until the
  //     rider collects money on delivery, so it's created immediately. ──
  const executeCashOrder = async () => {
    setIsSubmitting(true);
    try {
      const orderRes = await axiosInstance.post('/orders', buildOrderPayload());
      const order    = orderRes.data.data;

      await axiosInstance.post('/payments', {
        order_id: order.id,
        method:   'cash',
      });

      clearCartAndRedirect(order);

    } catch (err) {
      const message = err.response?.data?.message ?? 'Failed to place order. Please try again.';
      showError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── Validation ───────────────────────────────────────────
  const validateForm = () => {
    const e = {};
    if (!formData.fullName.trim())  e.fullName = 'Full name is required';
    if (!formData.phone.trim())     e.phone    = 'Phone number is required';
    else if (!/^[0-9]{9,10}$/.test(formData.phone.replace(/\s/g, '')))
                                    e.phone    = 'Invalid phone number';
    if (!formData.address.trim())   e.address  = 'Delivery address is required';
    if (!formData.city.trim())      e.city     = 'City is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handlePlaceOrder = () => {
    if (!validateForm()) return;
    if (formData.paymentMethod === 'card' || formData.paymentMethod === 'khqr') {
      openPaymentModal();
    } else {
      executeCashOrder();
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const formatTime = (s) =>
    `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  const getImageUrl = (p) =>
    !p ? '/placeholder-food.jpg'
      : p.startsWith('http') ? p
      : `http://127.0.0.1:8000/storage/${p}`;

  const qrStringValue = khqrPayload?.qr || '';

  return (
    <div className="w-full min-h-screen bg-[#FDFDFD] pt-20 pb-20 px-6 md:px-14">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="mb-12 border-b border-gray-100 pb-10">
          <button
            onClick={() => navigate('/cart')}
            className="flex items-center gap-2 text-[#2D4A22] font-black text-[10px] uppercase tracking-[0.3em] hover:text-[#F58220] transition-colors mb-6 group"
          >
            <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" />
            Back to Cart
          </button>
          <h1 className="text-4xl font-black text-[#2D4A22] uppercase tracking-tighter">
            Final <span className="text-[#F58220]">Checkout</span>
          </h1>
        </div>

        <div className="grid lg:grid-cols-12 gap-16">

          {/* Left: Form */}
          <div className="lg:col-span-7 space-y-12">
            <section>
              <h2 className="text-[11px] font-black text-[#2D4A22] uppercase tracking-[0.3em] mb-8 flex items-center gap-3">
                <span className="w-8 h-[1px] bg-[#F58220]" /> 01. Shipping Details
              </h2>
              <div className="grid md:grid-cols-2 gap-x-8 gap-y-6">

                <div className="md:col-span-2">
                  <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Full Name *</label>
                  <input
                    type="text" name="fullName" value={formData.fullName}
                    onChange={handleInputChange} placeholder="E.g. John Doe"
                    className={`w-full py-3 bg-transparent border-b-2 outline-none text-sm font-bold text-[#2D4A22] transition-colors
                      ${errors.fullName ? 'border-red-400' : 'border-gray-100 focus:border-[#2D4A22]'}`}
                  />
                  {errors.fullName && <p className="text-red-400 text-[9px] font-bold mt-1 uppercase italic">{errors.fullName}</p>}
                </div>

                <div>
                  <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Phone Number *</label>
                  <input
                    type="tel" name="phone" value={formData.phone}
                    onChange={handleInputChange} placeholder="012345678"
                    className={`w-full py-3 bg-transparent border-b-2 outline-none text-sm font-bold text-[#2D4A22] transition-colors
                      ${errors.phone ? 'border-red-400' : 'border-gray-100 focus:border-[#2D4A22]'}`}
                  />
                  {errors.phone && <p className="text-red-400 text-[9px] font-bold mt-1 uppercase italic">{errors.phone}</p>}
                </div>

                <div>
                  <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2 block">City *</label>
                  <input
                    type="text" name="city" value={formData.city}
                    onChange={handleInputChange} placeholder="Phnom Penh"
                    className={`w-full py-3 bg-transparent border-b-2 outline-none text-sm font-bold text-[#2D4A22] transition-colors
                      ${errors.city ? 'border-red-400' : 'border-gray-100 focus:border-[#2D4A22]'}`}
                  />
                  {errors.city && <p className="text-red-400 text-[9px] font-bold mt-1 uppercase italic">{errors.city}</p>}
                </div>

                <div className="md:col-span-2">
                  <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Address *</label>
                  <input
                    type="text" name="address" value={formData.address}
                    onChange={handleInputChange} placeholder="Street, Building, Room Number"
                    className={`w-full py-3 bg-transparent border-b-2 outline-none text-sm font-bold text-[#2D4A22] transition-colors
                      ${errors.address ? 'border-red-400' : 'border-gray-100 focus:border-[#2D4A22]'}`}
                  />
                  {errors.address && <p className="text-red-400 text-[9px] font-bold mt-1 uppercase italic">{errors.address}</p>}
                </div>

                <div className="md:col-span-2">
                  <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Notes (Optional)</label>
                  <textarea
                    name="notes" value={formData.notes} onChange={handleInputChange}
                    rows="2" placeholder="Special instructions..."
                    className="w-full py-3 bg-transparent border-b-2 border-gray-100 outline-none text-sm font-bold text-[#2D4A22] focus:border-[#2D4A22] resize-none transition-colors"
                  />
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-[11px] font-black text-[#2D4A22] uppercase tracking-[0.3em] mb-8 flex items-center gap-3">
                <span className="w-8 h-[1px] bg-[#F58220]" /> 02. Payment Method
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <label className={`cursor-pointer p-6 border-2 flex items-center gap-4 transition-all
                  ${formData.paymentMethod === 'cash' ? 'border-[#2D4A22] bg-gray-50' : 'border-gray-100'}`}>
                  <input type="radio" name="paymentMethod" value="cash"
                    checked={formData.paymentMethod === 'cash'}
                    onChange={handleInputChange} className="hidden" />
                  <FaMoneyBillWave className={formData.paymentMethod === 'cash' ? 'text-[#F58220]' : 'text-gray-300'} size={24} />
                  <div>
                    <p className="text-[10px] font-black text-[#2D4A22] uppercase tracking-widest">Cash on Delivery</p>
                    <p className="text-[8px] text-gray-400 font-bold uppercase mt-1">Pay the delivery rider directly</p>
                  </div>
                </label>

                <label className={`cursor-pointer p-6 border-2 flex items-center gap-4 transition-all
                  ${formData.paymentMethod === 'card' ? 'border-[#F58220] bg-orange-50/30' : 'border-gray-100'}`}>
                  <input type="radio" name="paymentMethod" value="card"
                    checked={formData.paymentMethod === 'card'}
                    onChange={handleInputChange} className="hidden" />
                  <FaCreditCard className={formData.paymentMethod === 'card' ? 'text-[#F58220]' : 'text-gray-300'} size={24} />
                  <div>
                    <p className="text-[10px] font-black text-[#2D4A22] uppercase tracking-widest">Pay Now via KHQR</p>
                    <p className="text-[8px] text-gray-400 font-bold uppercase mt-1">Auto-confirmed — no screenshot needed</p>
                  </div>
                </label>
              </div>
            </section>
          </div>

          {/* Right: Order Summary */}
          <div className="lg:col-span-5">
            <div className="bg-gray-50 p-8 sticky top-32 border border-gray-100 rounded-sm">
              <h2 className="text-xs font-black text-[#2D4A22] uppercase tracking-[0.3em] mb-8 border-b border-gray-200 pb-4 flex items-center gap-2">
                <MdOutlineReceiptLong size={16} /> Order Summary
              </h2>

              <div className="space-y-4 mb-8 max-h-[260px] overflow-y-auto pr-2">
                {cartItems.map(item => (
                  <div key={`${item.id}-${item.type}`} className="flex justify-between items-center group">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white p-1 border border-gray-100 flex-shrink-0">
                        <img
                          src={getImageUrl(item.image)} alt={item.name}
                          className="w-full h-full object-cover grayscale-[0.5] group-hover:grayscale-0 transition-all"
                          onError={e => { e.target.onerror = null; e.target.src = '/placeholder-food.jpg'; }}
                        />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-[#2D4A22] uppercase tracking-tighter leading-none">{item.name}</p>
                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">Qty: {item.quantity}</p>
                      </div>
                    </div>
                    <span className="text-xs font-black text-[#2D4A22]">${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-4 pt-6 border-t border-gray-200">
                <div className="flex justify-between text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                  <span>Subtotal</span>
                  <span className="text-[#2D4A22]">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                  <span className="italic text-[#F58220]">Delivery Fee</span>
                  <span className="text-[#2D4A22]">${delivery.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-end pt-6">
                  <span className="text-[10px] font-black text-[#2D4A22] uppercase tracking-[0.2em]">Total Amount</span>
                  <span className="text-3xl font-black text-[#2D4A22]">${total.toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={isSubmitting}
                className="w-full bg-[#2D4A22] text-white py-4 mt-10 font-black text-[11px] uppercase tracking-[0.4em] hover:bg-[#F58220] transition-all shadow-xl shadow-[#2D4A22]/20 active:scale-95 disabled:bg-gray-400"
              >
                {isSubmitting ? 'Processing...' : 'Place Order Now'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Error Modal */}
      {showErrorModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl p-8 flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-5">
              <FaExclamationTriangle className="text-red-400" size={28} />
            </div>
            <h3 className="text-sm font-black text-[#1c2e35] uppercase tracking-tight mb-2">
              Order Failed
            </h3>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide leading-relaxed mb-8">
              {orderError}
            </p>
            <button
              onClick={() => setShowErrorModal(false)}
              className="w-full py-3 rounded-xl bg-[#2D4A22] text-white text-[11px] font-black uppercase tracking-widest hover:bg-[#F58220] transition-all"
            >
              OK, Got It
            </button>
          </div>
        </div>
      )}

      {/* KHQR Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-[#1a2e14]/60 backdrop-blur-md">
          <div className="bg-white w-full max-w-[540px] rounded-[2.5rem] shadow-2xl relative overflow-hidden">

            <div className="pt-6 px-8 flex justify-between items-center">
              <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
                <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${timeLeft < 30 ? 'bg-red-500' : 'bg-[#F58220]'}`} />
                <span className={`text-[10px] font-black tracking-widest ${timeLeft < 30 ? 'text-red-500' : 'text-[#2D4A22]'}`}>
                  {formatTime(timeLeft)}
                </span>
              </div>
              <button
                onClick={handleCloseModal}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-red-50 text-gray-400 hover:text-red-500 transition-all"
              >
                <FaTimes size={18} />
              </button>
            </div>

            <div className="p-8 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div className="space-y-3">
                  <div className="bg-white p-5 flex items-center justify-center min-h-[220px]">
                    {generatingQr ? (
                      <FaSpinner className="animate-spin text-[#2D4A22]" size={32} />
                    ) : qrStringValue ? (
                      <QRCodeSVG value={qrStringValue} size={200} level="M" />
                    ) : (
                      <p className="text-[9px] font-bold text-gray-300 uppercase text-center px-4">
                        {khqrError ? (khqrErrorMsg ?? 'Failed — please retry') : 'Generating QR...'}
                      </p>
                    )}
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] font-black text-[#2D4A22] uppercase tracking-[0.2em]">Scan with any bank</p>
                    <p className="text-[16px] font-black text-[#F58220] tracking-tight mt-1 uppercase">
                      Total: ${total.toFixed(2)}
                    </p>
                  </div>
                  <BankBadges />
                </div>

                <div className="flex flex-col h-full justify-between py-1">
                  <div>
                    <h3 className="text-xl font-black text-[#245c0f] tracking-tighter uppercase leading-tight">{MERCHANT_NAME}</h3>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-5">Verified Merchant</p>
                  </div>

                  <div className="flex-1 flex flex-col items-center justify-center text-center">
                    {paymentConfirmed ? (
                      <>
                        <FaCheckCircle className="text-[#2D4A22] mb-3" size={48} />
                        <p className="text-sm font-black text-[#2D4A22] uppercase">Payment Received!</p>
                        <p className="text-[9px] font-bold text-gray-400 uppercase mt-1">Redirecting...</p>
                      </>
                    ) : khqrError ? (
                      <>
                        <FaExclamationTriangle className="text-red-400 mb-3" size={32} />
                        <p className="text-xs font-bold text-red-400 uppercase text-center px-2 mb-4">
                          {khqrErrorMsg ?? 'Something went wrong. Please try again.'}
                        </p>
                        {/* ✅ NEW: retry button — safe now, since nothing was
                            ever created for the expired/failed attempt */}
                        <button
                          onClick={handleRetryKhqr}
                          className="px-5 py-2 bg-[#2D4A22] text-white text-[10px] font-black uppercase tracking-widest rounded-full hover:bg-[#F58220] transition-all"
                        >
                          Generate New QR
                        </button>
                      </>
                    ) : (
                      <>
                        <FaSpinner className="animate-spin text-gray-300 mb-3" size={32} />
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                          Waiting for your payment...
                        </p>
                        <p className="text-[8px] font-bold text-gray-300 uppercase mt-1">
                          Auto-detected within seconds
                        </p>
                      </>
                    )}
                  </div>

                  <p className="text-center text-[7px] font-bold text-gray-300 uppercase tracking-[0.2em] mt-4">
                    Powered by KHQR — Cambodia's Unified QR Standard
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Checkout;