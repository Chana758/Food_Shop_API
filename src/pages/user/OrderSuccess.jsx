import React, { useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    FaCheckCircle, FaTimesCircle,
    FaHome, FaHistory, FaReceipt,
} from 'react-icons/fa';
import useEcho from '../../hooks/useEcho';
import { getImageUrl as buildImageUrl } from '../../utils/imageUrl';
import { useTranslation } from 'react-i18next';

const FALLBACK_IMG = 'https://placehold.co/400x300?text=Khmer+Fresh';

// Was hard-coded to 127.0.0.1, so images were broken on the live site
const getImageUrl = (path) =>
    path?.startsWith('blob') ? path : buildImageUrl(path, FALLBACK_IMG);

const getOrderTotal = (order) =>
    Number(order?.total_amount ?? order?.total ?? 0);

const WaitingScreen = ({ order }) => {
    const { t } = useTranslation();
    return (
    <div className="w-full min-h-screen bg-[#FDFDFD] flex flex-col items-center justify-center px-6">
        <div className="text-center max-w-md">
            <div className="flex justify-center mb-8">
                <div className="w-24 h-24 rounded-full border-4 border-[#4A5D23]/20 border-t-[#4A5D23] animate-spin" />
            </div>
            <h1 className="text-2xl font-black text-[#4A5D23] uppercase tracking-tight mb-3">
                {t('orderSuccess.waitingTitle')}
            </h1>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-8">
                {t('orderSuccess.waitingDesc')}
            </p>
            <div className="inline-flex items-center gap-3 bg-[#4A5D23]/5 border border-[#4A5D23]/10 px-6 py-3 rounded-full mb-8">
                <FaReceipt className="text-[#4A5D23]" size={14} />
                <span className="text-[11px] font-black text-[#4A5D23] uppercase tracking-widest">
                    {t('orderSuccess.orderNo', { id: order?.id })} — ${getOrderTotal(order).toFixed(2)}
                </span>
            </div>
            <div className="flex items-center justify-center gap-2">
                <div className="w-2 h-2 bg-[#F58220] rounded-full animate-pulse" />
                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
                    {t('orderSuccess.live')}
                </span>
            </div>
        </div>
    </div>
);
};

// Paid Screen 
const PaidScreen = ({ order, orderData, navigate }) => {
    const { t, i18n } = useTranslation();
    const formatDate = (d) =>
        new Date(d).toLocaleDateString(i18n.language === 'kh' ? 'km-KH' : 'en-US', {
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
                        {isCashOnDelivery ? t('orderSuccess.orderConfirmed') : t('orderSuccess.paymentConfirmed')}
                    </h1>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">
                        {isCashOnDelivery
                            ? t('orderSuccess.prepareCash', { amount: `$${Number(total).toFixed(2)}` })
                            : t('orderSuccess.beingPrepared')}
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8 items-start">

                    {/* Left — Receipt */}
                    <div className="bg-white border border-gray-100 p-8 rounded-sm shadow-sm">
                        <h2 className="text-[11px] font-black text-[#4A5D23] uppercase tracking-[0.2em] mb-8 border-b border-gray-50 pb-4">
                            {t('orderSuccess.receiptDetails')}
                        </h2>

                        {items.length === 0 ? (
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-8">
                                {t('orderSuccess.noItems')}
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
                                                    onError={e => { e.target.onerror = null; e.target.src = FALLBACK_IMG; }}
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
                                <span>{t('checkout.subtotal')}</span>
                                <span className="text-[#4A5D23]">${Number(subtotal).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                <span>{t('checkout.delivery')}</span>
                                <span className="text-[#4A5D23]">${Number(delivery).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                                <span className="text-[11px] font-black text-[#4A5D23] uppercase tracking-widest">{t('checkout.total')}</span>
                                <span className="text-3xl font-black text-[#F58220]">
                                    ${Number(total).toFixed(2)}
                                </span>
                            </div>
                        </div>

                        {receiptPreview && (
                            <div className="mt-6 pt-6 border-t border-gray-100">
                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-3">
                                    {t('orderSuccess.paymentProof')}
                                </p>
                                <img
                                    src={receiptPreview}
                                    alt={t('orderSuccess.paymentProof')}
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
                                {t('orderSuccess.estimatedDelivery')}
                            </p>
                            <h2 className="text-5xl font-black tracking-tighter mb-6">{t('orderSuccess.eta')}</h2>
                            <p className="text-[10px] font-black uppercase tracking-widest">
                                {t('orderHistory.orderID')}: #{order?.id}
                            </p>
                            <p className="text-[9px] font-medium text-gray-300 uppercase tracking-widest mt-1">
                                {formatDate(orderData?.date ?? new Date())}
                            </p>
                            {isCashOnDelivery && (
                                <p className="mt-4 pt-4 border-t border-white/20 text-[10px] font-bold uppercase tracking-widest">
                                    💵 {t('orderSuccess.exactCash')}
                                </p>
                            )}
                        </div>

                        {customerInfo.fullName && (
                            <div className="bg-white border border-gray-100 p-8 rounded-sm shadow-sm">
                                <h2 className="text-[11px] font-black text-[#4A5D23] uppercase tracking-[0.2em] mb-6">
                                    {t('orderSuccess.deliveryTo')}
                                </h2>
                                <div className="space-y-4">
                                    {[
                                        { label: t('checkout.fullName'),     value: customerInfo.fullName },
                                        { label: t('checkout.phoneNumber'),  value: customerInfo.phone },
                                        { label: t('checkout.address'),      value: `${customerInfo.address}, ${customerInfo.city}` },
                                        {
                                            label: t('orderSuccess.paymentMethod'),
                                            value: isCashOnDelivery
                                                ? t('checkout.cashOnDelivery')
                                                : t('orderSuccess.khqrPaid'),
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
                        <FaHome size={14} /> {t('orderSuccess.backToHome')}
                    </button>
                    <button
                        onClick={() => navigate('/order-history')}
                        className="px-10 py-4 border border-[#4A5D23] text-[#4A5D23] font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-gray-50 transition-all"
                    >
                        <FaHistory size={14} /> {t('orderSuccess.viewOrderHistory')}
                    </button>
                </div>
            </div>
        </div>
    );
};

const RejectedScreen = ({ order, navigate }) => {
    const { t } = useTranslation();
    return (
    <div className="w-full min-h-screen bg-[#FDFDFD] flex flex-col items-center justify-center px-6">
        <div className="text-center max-w-md">
            <div className="flex justify-center mb-8">
                <div className="w-20 h-20 bg-red-50 border border-red-100 rounded-full flex items-center justify-center">
                    <FaTimesCircle className="text-red-500 text-4xl" />
                </div>
            </div>
            <h1 className="text-3xl font-black text-red-600 uppercase tracking-tight mb-3">
                {t('orderSuccess.rejectedTitle')}
            </h1>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-4">
                {t('orderSuccess.rejectedDesc', { id: order?.id })}
            </p>
            <p className="text-[10px] text-gray-400 mb-10">
                {t('orderSuccess.rejectedHint')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                    onClick={() => navigate('/checkout')}
                    className="px-8 py-4 bg-[#4A5D23] text-white font-black text-[10px] uppercase tracking-[0.2em] hover:bg-[#3a4a1c] transition-all"
                >
                    {t('error.retry')}
                </button>
                <button
                    onClick={() => navigate('/')}
                    className="px-8 py-4 border border-gray-200 text-gray-500 font-black text-[10px] uppercase tracking-[0.2em] hover:bg-gray-50 transition-all"
                >
                    {t('orderSuccess.backToHome')}
                </button>
            </div>
        </div>
    </div>
);
};

const NoOrderScreen = ({ navigate }) => {
    const { t } = useTranslation();
    return (
    <div className="w-full min-h-screen bg-[#FDFDFD] flex flex-col items-center justify-center px-6">
        <div className="text-center max-w-md">
            <h1 className="text-2xl font-black text-[#4A5D23] uppercase tracking-tight mb-3">
                {t('orderSuccess.noOrderTitle')}
            </h1>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-8">
                {t('orderSuccess.noOrderDesc')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                    onClick={() => navigate('/order-history')}
                    className="px-8 py-4 bg-[#4A5D23] text-white font-black text-[10px] uppercase tracking-[0.2em] hover:bg-[#3a4a1c] transition-all"
                >
                    {t('orderSuccess.viewOrderHistory')}
                </button>
                <button
                    onClick={() => navigate('/')}
                    className="px-8 py-4 border border-gray-200 text-gray-500 font-black text-[10px] uppercase tracking-[0.2em] hover:bg-gray-50 transition-all"
                >
                    {t('orderSuccess.backToHome')}
                </button>
            </div>
        </div>
    </div>
);
};

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