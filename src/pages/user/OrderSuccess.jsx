import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    FaCheckCircle, FaTimesCircle,
    FaHome, FaHistory, FaReceipt,
} from 'react-icons/fa';
import useEcho from '../../hooks/useEcho';

const getImageUrl = (path) => {
    if (!path) return '/placeholder-food.jpg';
    if (path.startsWith('http') || path.startsWith('blob')) return path;
    return `http://127.0.0.1:8000/storage/${path}`;
};

const getOrderTotal = (order) =>
    Number(order?.total_amount ?? order?.total ?? 0);

const WaitingScreen = ({ order }) => (
    <div className="w-full min-h-screen bg-[#FDFDFD] flex flex-col items-center justify-center px-6">
        <div className="text-center max-w-md">
            <div className="flex justify-center mb-8">
                <div className="w-24 h-24 rounded-full border-4 border-[#4A5D23]/20 border-t-[#4A5D23] animate-spin" />
            </div>
            <h1 className="text-2xl font-black text-[#4A5D23] uppercase tracking-tight mb-3">
                Waiting for Confirmation
            </h1>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-8">
                Admin is reviewing your payment receipt
            </p>
            <div className="inline-flex items-center gap-3 bg-[#4A5D23]/5 border border-[#4A5D23]/10 px-6 py-3 rounded-full mb-8">
                <FaReceipt className="text-[#4A5D23]" size={14} />
                <span className="text-[11px] font-black text-[#4A5D23] uppercase tracking-widest">
                    Order #{order?.id} — ${getOrderTotal(order).toFixed(2)}
                </span>
            </div>
            <div className="flex items-center justify-center gap-2">
                <div className="w-2 h-2 bg-[#F58220] rounded-full animate-pulse" />
                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
                    Live — connected
                </span>
            </div>
        </div>
    </div>
);

// ── Paid Screen ───────────────────────────────────────────────────────────
const PaidScreen = ({ order, orderData, navigate }) => {
    const formatDate = (d) =>
        new Date(d).toLocaleDateString('en-US', {
            month: 'long', day: 'numeric', year: 'numeric',
            hour: '2-digit', minute: '2-digit',
        });

    const items          = orderData?.items        ?? [];
    const customerInfo   = orderData?.customerInfo  ?? {};
    const subtotal       = orderData?.subtotal      ?? 0;
    const delivery       = orderData?.delivery      ?? 0;
    const total           = orderData?.total ?? getOrderTotal(order);
    const receiptPreview  = orderData?.receiptPreview;

    const isCashOnDelivery = customerInfo.paymentMethod === 'cash';

    return (
        <div className="w-full min-h-screen bg-[#FDFDFD] pt-24 pb-20 px-6">
            <div className="max-w-5xl mx-auto">

                {/* Success hero */}
                <div className="text-center mb-12">
                    <div className="flex justify-center mb-4">
                        <div className="w-16 h-16 bg-[#4A5D23] rounded-full flex items-center justify-center shadow-lg animate-bounce">
                            <FaCheckCircle className="text-white text-3xl" />
                        </div>
                    </div>
                    <h1 className="text-4xl font-black text-[#4A5D23] tracking-tight uppercase mb-2">
                        {isCashOnDelivery ? 'Order Confirmed!' : 'Payment Confirmed!'}
                    </h1>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">
                        {isCashOnDelivery
                            ? `Please prepare $${Number(total).toFixed(2)} cash — pay when your order arrives`
                            : 'Your order has been received and is being prepared'}
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8 items-start">

                    {/* Left — Receipt */}
                    <div className="bg-white border border-gray-100 p-8 rounded-sm shadow-sm">
                        <h2 className="text-[11px] font-black text-[#4A5D23] uppercase tracking-[0.2em] mb-8 border-b border-gray-50 pb-4">
                            Receipt Details
                        </h2>

                        {items.length === 0 ? (
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-8">
                                No item details available for this order.
                            </p>
                        ) : (
                            <div className="space-y-0 mb-8">
                                {items.map((item, i) => (
                                    <div key={i} className="flex justify-between items-start border-b border-gray-50 pb-6 last:border-0">
                                        <div className="flex gap-4">
                                            <div className="w-14 h-14 bg-gray-50 border border-gray-100 overflow-hidden">
                                                <img
                                                    src={getImageUrl(item.image)}
                                                    alt={item.name}
                                                    className="w-full h-full object-cover"
                                                    onError={e => { e.target.src = '/placeholder-food.jpg'; }}
                                                />
                                            </div>
                                            <div>
                                                <h3 className="text-[11px] font-black text-[#4A5D23] uppercase leading-tight">
                                                    {item.name}
                                                </h3>
                                                <p className="text-[9px] font-bold text-gray-400 uppercase mt-1">
                                                    {item.quantity} x ${Number(item.price).toFixed(2)}
                                                </p>
                                                <p className="text-[10px] font-black text-[#F58220] mt-3 bg-orange-50 inline-block px-2 py-0.5 rounded">
                                                    ${(item.quantity * item.price).toFixed(2)}
                                                </p>
                                            </div>
                                        </div>
                                        <span className="text-[12px] font-black text-[#4A5D23]">
                                            ${Number(item.price).toFixed(2)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="bg-gray-50 p-6 space-y-3">
                            <div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                <span>Subtotal</span>
                                <span className="text-[#4A5D23]">${Number(subtotal).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                <span>Delivery</span>
                                <span className="text-[#4A5D23]">${Number(delivery).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                                <span className="text-[11px] font-black text-[#4A5D23] uppercase tracking-widest">Total</span>
                                <span className="text-3xl font-black text-[#F58220]">
                                    ${Number(total).toFixed(2)}
                                </span>
                            </div>
                        </div>

                        {receiptPreview && (
                            <div className="mt-6 pt-6 border-t border-gray-100">
                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-3">
                                    Payment Proof
                                </p>
                                <img
                                    src={receiptPreview}
                                    alt="Receipt"
                                    className="w-32 h-auto rounded border border-gray-100 shadow-sm"
                                    onError={e => { e.target.style.display = 'none'; }}
                                />
                            </div>
                        )}
                    </div>

                    {/* Right — Info */}
                    <div className="space-y-6">
                        <div className="p-8 rounded-sm text-white shadow-xl bg-[#4A5D23]">
                            <p className="text-[9px] font-black uppercase tracking-[0.2em] mb-2 text-[#F58220]">
                                Estimated Arrival
                            </p>
                            <h2 className="text-5xl font-black tracking-tighter mb-6">30-45 MIN</h2>
                            <p className="text-[10px] font-black uppercase tracking-widest">
                                Order ID: #{order?.id}
                            </p>
                            <p className="text-[9px] font-medium text-gray-300 uppercase tracking-widest mt-1">
                                {formatDate(orderData?.date ?? new Date())}
                            </p>
                            {isCashOnDelivery && (
                                <p className="mt-4 pt-4 border-t border-white/20 text-[10px] font-bold uppercase tracking-widest">
                                    💵 Have exact cash ready for the rider
                                </p>
                            )}
                        </div>

                        {customerInfo.fullName && (
                            <div className="bg-white border border-gray-100 p-8 rounded-sm shadow-sm">
                                <h2 className="text-[11px] font-black text-[#4A5D23] uppercase tracking-[0.2em] mb-6">
                                    Delivery To
                                </h2>
                                <div className="space-y-4">
                                    {[
                                        { label: 'Name',    value: customerInfo.fullName },
                                        { label: 'Phone',   value: customerInfo.phone },
                                        { label: 'Address', value: `${customerInfo.address}, ${customerInfo.city}` },
                                        {
                                            label: 'Method',
                                            value: isCashOnDelivery
                                                ? 'Cash on Delivery'
                                                : 'KHQR (Paid)',
                                        },
                                    ].map(({ label, value }) => (
                                        <div key={label} className="border-b border-gray-50 pb-3">
                                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">{label}</p>
                                            <p className="text-[11px] font-black text-[#4A5D23] uppercase">{value}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="mt-16 flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                        onClick={() => navigate('/')}
                        className="px-10 py-4 bg-[#4A5D23] text-white font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-[#3a4a1c] transition-all shadow-lg"
                    >
                        <FaHome size={14} /> Back to Home
                    </button>
                    <button
                        onClick={() => navigate('/order-history')}
                        className="px-10 py-4 border border-[#4A5D23] text-[#4A5D23] font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-gray-50 transition-all"
                    >
                        <FaHistory size={14} /> View History
                    </button>
                </div>
            </div>
        </div>
    );
};

const RejectedScreen = ({ order, navigate }) => (
    <div className="w-full min-h-screen bg-[#FDFDFD] flex flex-col items-center justify-center px-6">
        <div className="text-center max-w-md">
            <div className="flex justify-center mb-8">
                <div className="w-20 h-20 bg-red-50 border border-red-100 rounded-full flex items-center justify-center">
                    <FaTimesCircle className="text-red-500 text-4xl" />
                </div>
            </div>
            <h1 className="text-3xl font-black text-red-600 uppercase tracking-tight mb-3">
                Payment Rejected
            </h1>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-4">
                Admin could not verify your payment for Order #{order?.id}
            </p>
            <p className="text-[10px] text-gray-400 mb-10">
                Please check your receipt and try again, or contact support.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                    onClick={() => navigate('/checkout')}
                    className="px-8 py-4 bg-[#4A5D23] text-white font-black text-[10px] uppercase tracking-[0.2em] hover:bg-[#3a4a1c] transition-all"
                >
                    Try Again
                </button>
                <button
                    onClick={() => navigate('/')}
                    className="px-8 py-4 border border-gray-200 text-gray-500 font-black text-[10px] uppercase tracking-[0.2em] hover:bg-gray-50 transition-all"
                >
                    Back to Home
                </button>
            </div>
        </div>
    </div>
);

const NoOrderScreen = ({ navigate }) => (
    <div className="w-full min-h-screen bg-[#FDFDFD] flex flex-col items-center justify-center px-6">
        <div className="text-center max-w-md">
            <h1 className="text-2xl font-black text-[#4A5D23] uppercase tracking-tight mb-3">
                No Order Found
            </h1>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-8">
                We couldn't find order details for this page — this can happen after a refresh.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                    onClick={() => navigate('/order-history')}
                    className="px-8 py-4 bg-[#4A5D23] text-white font-black text-[10px] uppercase tracking-[0.2em] hover:bg-[#3a4a1c] transition-all"
                >
                    View Order History
                </button>
                <button
                    onClick={() => navigate('/')}
                    className="px-8 py-4 border border-gray-200 text-gray-500 font-black text-[10px] uppercase tracking-[0.2em] hover:bg-gray-50 transition-all"
                >
                    Back to Home
                </button>
            </div>
        </div>
    </div>
);

const OrderSuccess = () => {
    const navigate  = useNavigate();
    const location  = useLocation();

    const locationOrder = location.state?.order ?? null;
    const orderId        = locationOrder?.id ?? null;

    const [paymentStatus, setPaymentStatus] = useState(() =>
        locationOrder ? 'paid' : 'waiting'
    );
    const [liveOrder, setLiveOrder] = useState(null);

    const hasOrder = Boolean(locationOrder);

    const handlePaid = useCallback((order) => {
        setLiveOrder(order);
        setPaymentStatus('paid');
    }, []);

    const handleRejected = useCallback((order) => {
        setLiveOrder(order);
        setPaymentStatus('rejected');
    }, []);

    const shouldListen = hasOrder && locationOrder?.customerInfo?.paymentMethod !== 'cash';
    useEcho(shouldListen ? orderId : null, {
        onPaid:     handlePaid,
        onRejected: handleRejected,
    });

    if (!hasOrder) {
        return <NoOrderScreen navigate={navigate} />;
    }

    if (paymentStatus === 'rejected') {
        return <RejectedScreen order={liveOrder ?? locationOrder} navigate={navigate} />;
    }

    if (paymentStatus === 'waiting') {
        return <WaitingScreen order={liveOrder ?? locationOrder} />;
    }

    return (
        <PaidScreen
            order={liveOrder ?? locationOrder}
            orderData={locationOrder}
            navigate={navigate}
        />
    );
};

export default OrderSuccess;