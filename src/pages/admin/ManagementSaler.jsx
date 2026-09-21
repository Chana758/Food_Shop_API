import React, { useEffect, useRef, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  LuPlus, LuMinus, LuTrash2, LuShoppingCart,
  LuUtensilsCrossed, LuPackage, LuCheck,
  LuGlassWater, LuZap, LuSalad, LuSearch,
  LuSunrise, LuWaves, LuLeaf, LuWheat, LuFish,
  LuTag, LuPrinter, LuX, LuBanknote, LuCreditCard, LuQrCode,
  LuFlame, LuFlaskConical, LuClock
} from 'react-icons/lu';
import { FaSpinner } from 'react-icons/fa';
import { categoryService } from '../../service/categoryService';
import { productService }  from '../../service/productService';
import orderService   from '../../service/orderService';
import paymentService from '../../service/paymentService';
import { hasDiscount, getFinalPrice, getDiscountPercent, getDiscountExpiryLabel, fmt } from '../../utils/priceUtils';
import { ENABLE_TEST_PAYMENT } from '../../config/khqrConfig';
import POSKhqrModal from '../../components/payment/POSKhqrModal';
import { useSettings } from '../../context/SettingsContext'; 

// STATIC DATA 
const AVAILABLE_TABLES = [
  { id: 1, name: 'Table 01' },
  { id: 3, name: 'Table 03' },
  { id: 5, name: 'Table 05' },
  { id: 7, name: 'Table 07' },
];

// HELPERS 
const getImageUrl = (image) => {
  if (!image) return null;
  if (image.startsWith('http')) return image;
  const cleanPath = image.replace('public/', '');
  return cleanPath.startsWith('storage/')
    ? `http://127.0.0.1:8000/${cleanPath}`
    : `http://127.0.0.1:8000/storage/${cleanPath}`;
};

const CategoryIcon = ({ category, size = 18, className = '' }) => {
  const props = { size, className };
  switch (category) {
    case 'Drinks':    return <LuGlassWater {...props} />;
    case 'Dessert':   return <LuSalad {...props} />;
    case 'Snack':     return <LuZap {...props} />;
    case 'Breakfast': return <LuSunrise {...props} />;
    case 'Noodles':   return <LuWaves {...props} />;
    case 'Salad':     return <LuLeaf {...props} />;
    case 'Seafood':   return <LuFish {...props} />;
    case 'Rice Dish': return <LuWheat {...props} />;
    default:          return <LuUtensilsCrossed {...props} />;
  }
};

//RECEIPT PRINT HELPER (Standard POS format) 
const printReceipt = ({
  cart, subtotal, discountAmt, grandTotal, paymentMethod, cashReceived, change,
  orderType, tableId, notes, orderNo, cashierName, isTest, settings = {},
}) => {
  const tableLabel = AVAILABLE_TABLES.find(t => String(t.id) === String(tableId))?.name || '';

  const restaurantName = settings.restaurant_name || 'Khmer-Fresh';
  const tagline        = settings.tagline || 'Authentic Traditional Food';
  const address         = settings.address || '';
  const phone           = settings.phone || '';
  const currency        = settings.currency || 'USD';
  const showLogo         = settings.show_logo_receipt !== false;
  const showTax           = settings.show_tax_receipt === true;
  const taxRate            = parseFloat(settings.tax_rate) || 0;
  const footerNote          = settings.receipt_note || 'Thank you for dining with us!';

  const taxAmount = showTax && taxRate > 0
    ? Math.round((grandTotal * (taxRate / 100)) * 100) / 100
    : 0;
  const finalTotal = grandTotal + taxAmount;

  const paymentMethods = [
    { id: 'cash',  label: 'Cash' },
    { id: 'card',  label: 'Card' },
    { id: 'khqr',  label: 'KHQR' },
    { id: 'test',  label: 'ក្លែងបង់' },
  ];
  const methodLabel = paymentMethods.find(m => m.id === paymentMethod)?.label
    || (paymentMethod === 'khqr' ? 'KHQR' : paymentMethod);

  const html = `
<!DOCTYPE html><html><head><meta charset="UTF-8"/>
<style>
  *{margin:0;padding:0;box-sizing:border-box;}
  body{font-family:'Courier New',monospace;font-size:12px;width:280px;padding:12px;}
  h1{font-size:16px;text-align:center;font-weight:bold;margin-bottom:2px;}
  .sub{text-align:center;font-size:10px;color:#555;margin-bottom:2px;}
  .contact{text-align:center;font-size:9px;color:#777;margin-bottom:2px;}
  hr{border:none;border-top:1px dashed #999;margin:6px 0;}
  .row{display:flex;justify-content:space-between;margin:2px 0;}
  .row.bold{font-weight:bold;}
  .row.total{font-size:14px;font-weight:bold;border-top:1px solid #000;padding-top:4px;margin-top:4px;}
  .row.discount{color:#e11d48;}
  .row.tax{color:#334155;}
  .row.change{color:#059669;}
  .center{text-align:center;}
  .small{font-size:10px;color:#777;}
  .test-badge{display:inline-block;border:1.5px dashed #d97706;color:#b45309;background:#fffbeb;padding:3px 10px;border-radius:4px;font-size:10px;font-weight:bold;margin:6px 0;letter-spacing:0.5px;}
  .table-box{
    display:flex;justify-content:space-between;align-items:center;
    background:#111827;color:#fbbf24;
    border-radius:6px;padding:8px 12px;margin:8px 0;
  }
  .table-box .label{font-size:10px;font-weight:bold;text-transform:uppercase;letter-spacing:0.5px;color:#cbd5e1;}
  .table-box .value{font-size:18px;font-weight:900;}
</style>
</head><body>
${showLogo ? `<h1>🍃 ${restaurantName}</h1>` : `<h1>${restaurantName}</h1>`}
<div class="sub">${tagline}</div>
${(address || phone) ? `<div class="contact">${[address, phone].filter(Boolean).join(' · ')}</div>` : ''}
${isTest ? `<div class="center"><span class="test-badge">⚠ DEMO / TEST TRANSACTION</span></div>` : ''}
<hr/>
<div class="row bold"><span>Receipt No.</span><span>${orderNo}</span></div>
<div class="row"><span>Type</span><span>${orderType === 'dine-in' ? 'Dine-In' : 'Takeaway'}</span></div>
<div class="row"><span>Date</span><span>${new Date().toLocaleString('km-KH',{hour12:false})}</span></div>
<div class="row"><span>Cashier</span><span>${cashierName || 'Staff'}</span></div>

${orderType === 'dine-in' && tableLabel ? `
<div class="table-box">
  <span class="label">Table No.</span>
  <span class="value">${tableLabel.replace('Table ', '')}</span>
</div>` : ''}

<hr/>
${cart.map(item => {
  const fp   = getFinalPrice(item.price, item.discount_price, item.discount_expires_at);
  const disc = hasDiscount(item.price, item.discount_price, item.discount_expires_at);
  return `
<div class="row">
  <span style="max-width:160px;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;">${item.name}</span>
  <span>${fmt(fp * item.qty, currency)}</span>
</div>
<div class="small row">
  <span>  x${item.qty} @ ${fmt(fp, currency)}${disc ? ` (was ${fmt(item.price, currency)})` : ''}</span>
</div>`;
}).join('')}
<hr/>
<div class="row"><span>Subtotal</span><span>${fmt(subtotal, currency)}</span></div>
${discountAmt > 0 ? `<div class="row discount"><span>Order Discount</span><span>-${fmt(discountAmt, currency)}</span></div>` : ''}
${showTax && taxAmount > 0 ? `<div class="row tax"><span>Tax (${taxRate}%)</span><span>${fmt(taxAmount, currency)}</span></div>` : ''}
<div class="row total"><span>TOTAL</span><span>${fmt(finalTotal, currency)}</span></div>
<hr/>
<div class="row"><span>Payment</span><span>${methodLabel}</span></div>
${paymentMethod === 'cash' ? `
<div class="row"><span>Cash</span><span>${fmt(cashReceived, currency)}</span></div>
<div class="row change bold"><span>Change</span><span>${fmt(change, currency)}</span></div>` : ''}
${notes ? `<hr/><div class="small">Notes: ${notes}</div>` : ''}
<hr/>
<div class="center small">${footerNote}</div>
${isTest ? `<div class="center small" style="margin-top:4px;color:#b45309;">This receipt is for testing only — not a real sale.</div>` : ''}
</body></html>`;

  const w = window.open('', '_blank', 'width=320,height=600');
  w.document.write(html);
  w.document.close();
  w.focus();
  setTimeout(() => { w.print(); w.close(); }, 400);
};

// MAIN COMPONENT 
const ManagementSaler = () => {
  const { searchTerm = '' } = useOutletContext() || {};
  const { settings } = useSettings();

  const currency = settings.currency || 'USD';

  const PAYMENT_METHODS = [
    { id: 'cash',  label: 'Cash',   icon: LuBanknote   },
    { id: 'card',  label: 'Card',   icon: LuCreditCard  },
    { id: 'khqr',  label: 'KHQR',   icon: LuQrCode      },
    ...(ENABLE_TEST_PAYMENT ? [{ id: 'test', label: 'ក្លែងបង់', icon: LuFlaskConical }] : []),
  ];

  const [categories, setCategories] = useState([]);
  const [products,   setProducts]   = useState([]);
  const [isLoading,  setIsLoading]  = useState(true);
  const [loadError,  setLoadError]  = useState(null);

  const [activeCategory, setActiveCategory] = useState('All');
  const [orderType, setOrderType]           = useState('dine-in');
  const [tableId,   setTableId]             = useState('');
  const [cart,      setCart]                = useState([]);
  const [notes,     setNotes]               = useState('');

  const [discountType,  setDiscountType]  = useState('%');
  const [discountValue, setDiscountValue] = useState('');

  const [showPayment,    setShowPayment]    = useState(false);
  const [paymentMethod,  setPaymentMethod]  = useState('cash');
  const [cashReceived,   setCashReceived]   = useState('');
  const [placed,         setPlaced]         = useState(false);
  const [isPlacing,  setIsPlacing]  = useState(false);
  const [placeError, setPlaceError] = useState(null);

  const [pendingOrder,  setPendingOrder]  = useState(null);
  const [showKhqrScan,  setShowKhqrScan]  = useState(false);
  const [cancellingOrder, setCancellingOrder] = useState(false);

  const cashInputRef = useRef(null);

  useEffect(() => {
    let isMounted = true;
    const loadMenuData = async () => {
      setIsLoading(true); setLoadError(null);
      try {
        const [catRes, prodRes] = await Promise.all([
          categoryService.getAll({ per_page: 100 }),
          productService.getAll({ per_page: 100 }),
        ]);
        if (!isMounted) return;
        const catList  = catRes?.data?.data  || catRes?.data  || [];
        const prodList = prodRes?.data?.data || prodRes?.data || [];
        setCategories(Array.isArray(catList)  ? catList  : []);
        setProducts(Array.isArray(prodList)   ? prodList : []);
      } catch (err) { if (isMounted) setLoadError(err); }
      finally       { if (isMounted) setIsLoading(false); }
    };
    loadMenuData();
    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    if (showPayment && paymentMethod === 'cash') {
      setTimeout(() => cashInputRef.current?.focus(), 100);
    }
  }, [showPayment, paymentMethod]);

  useEffect(() => {
    if (settings.table_service === false && orderType === 'dine-in') {
      setOrderType('takeaway');
      setTableId('');
    }
  }, [settings.table_service]); // eslint-disable-line react-hooks/exhaustive-deps

  const categoryTabs = ['All', ...categories.map(c => c.name)];

  const filtered = products.filter(p => {
    const catName = p.category?.name || '';
    return (activeCategory === 'All' || catName === activeCategory) &&
      (p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
       catName.toLowerCase().includes(searchTerm.toLowerCase()));
  });

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === product.id);
      if (existing) return prev.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const updateQty  = (id, delta) =>
    setCart(prev => prev.map(i => i.id === id ? { ...i, qty: i.qty + delta } : i).filter(i => i.qty > 0));

  const removeItem = (id) => setCart(prev => prev.filter(i => i.id !== id));
  const cartQty    = (id) => cart.find(i => i.id === id)?.qty ?? 0;

  const subtotal = cart.reduce((sum, i) => {
    const price = getFinalPrice(i.price, i.discount_price, i.discount_expires_at);
    return sum + price * i.qty;
  }, 0);

  const discountAmt = (() => {
    const v = parseFloat(discountValue) || 0;
    if (!v) return 0;
    if (discountType === '%') return Math.min(subtotal, (subtotal * v) / 100);
    return Math.min(subtotal, v);
  })();

  const preTaxTotal = Math.max(0, subtotal - discountAmt);
  const showTax      = settings.show_tax_receipt === true;
  const taxRate        = parseFloat(settings.tax_rate) || 0;
  const taxAmt          = showTax && taxRate > 0
    ? Math.round((preTaxTotal * (taxRate / 100)) * 100) / 100
    : 0;

  const grandTotal  = preTaxTotal + taxAmt;
  const totalItems  = cart.reduce((s, i) => s + i.qty, 0);
  const cashNum     = parseFloat(cashReceived) || 0;
  const change      = Math.max(0, cashNum - grandTotal);
  const canPlace    = cart.length > 0 && (orderType === 'takeaway' || tableId);
  const cashValid   = paymentMethod !== 'cash' || cashNum >= grandTotal;
  const isTestPay   = paymentMethod === 'test';
  const isKhqrPay   = paymentMethod === 'khqr';

  const finishOrder = ({ orderNo, methodOverride }) => {
    printReceipt({
      cart, subtotal, discountAmt, grandTotal: preTaxTotal, // pass pre-tax; printReceipt re-applies from settings
      paymentMethod: methodOverride || paymentMethod,
      cashReceived: cashNum, change,
      orderType, tableId, notes,
      orderNo,
      cashierName: sessionStorage.getItem('cashierName'),
      isTest: isTestPay,
      settings, 
    });

    setPlaced(true);
    setTimeout(() => {
      setPlaced(false);
      setCart([]);
      setNotes('');
      setTableId('');
      setDiscountValue('');
      setCashReceived('');
      setPaymentMethod('cash');
      setShowPayment(false);
      setIsPlacing(false);
      setPendingOrder(null);
    }, 2000);
  };

  const handlePlaceOrder = async () => {
    if (!canPlace || !cashValid || isPlacing) return;
    setIsPlacing(true);
    setPlaceError(null);
    try {
      const orderPayload = {
        order_type: orderType,
        table_id:   orderType === 'dine-in' ? tableId : null,
        notes: isTestPay ? `${notes ? notes + ' — ' : ''}[DEMO/TEST ORDER]` : notes,
        discount_amount: discountAmt,
        // ✅ FIX (Bug 1): send the SAME tax figure used to build grandTotal
        // (and therefore the KHQR QR amount / printed receipt total) so
        // OrderController::store() computes total_amount identically —
        // otherwise Bakong's reported paid amount would never match
        // payments.amount whenever tax is enabled in Settings.
        tax_amount: taxAmt,
        items: cart.map(item => ({
          product_id: item.id,
          quantity:   item.qty,
          note:       '',
        })),
      };

      const order = await orderService.create(orderPayload);

      if (isKhqrPay) {
        setPendingOrder({ id: order.id, orderNo: `KF-${order.id}` });
        setShowKhqrScan(true);
        setIsPlacing(false);
        return;
      }

      await paymentService.create({
        order_id: order.id,
        method: isTestPay ? 'cash' : paymentMethod,
        // ✅ FIX (Bug 2): the cashier has already physically collected
        // cash/card money at the register right now — tell the backend
        // to mark this payment (and the order) 'paid' immediately
        // instead of leaving it 'pending' forever. KHQR is untouched —
        // it still goes through POSKhqrModal → checkStatus() → Bakong
        // verification, never a client-asserted flag.
        paid_now: true,
        ...(isTestPay ? { transaction_ref: `DEMO-${Date.now()}` } : {}),
      });

      finishOrder({ orderNo: `KF-${order.id}` });

    } catch (err) {
      console.error('POS order failed:', err.response ?? err);
      setPlaceError(err.response?.data?.message ?? 'Failed to save order. Please try again.');
      setIsPlacing(false);
    }
  };

  const handleKhqrPaid = () => {
    setShowKhqrScan(false);
    if (pendingOrder) {
      finishOrder({ orderNo: pendingOrder.orderNo, methodOverride: 'khqr' });
    }
  };

  const handleKhqrClose = async () => {
    setShowKhqrScan(false);

    if (pendingOrder && !cancellingOrder) {
      setCancellingOrder(true);
      try {
        await orderService.cancel(pendingOrder.id);
      } catch (err) {
        console.warn('Failed to cancel abandoned KHQR order:', err.response ?? err);
      } finally {
        setCancellingOrder(false);
      }
    }

    setPendingOrder(null);
    setIsPlacing(false);
  };

  if (isLoading) return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-8">
      <div className="w-12 h-12 border-4 border-amber-100 border-t-amber-500 rounded-full animate-spin shadow-md" />
      <p className="text-xs font-black uppercase tracking-widest text-slate-400 mt-4 animate-pulse">Loading menu items...</p>
    </div>
  );

  if (loadError) return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-8 text-rose-500 font-bold">
      <p>Failed to load menu: {loadError.message}</p>
      <button onClick={() => window.location.reload()}
        className="mt-4 px-5 py-2.5 bg-slate-900 text-white text-xs rounded-xl shadow-lg uppercase hover:bg-black transition-colors">Retry</button>
    </div>
  );

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-6 font-sans" style={{ background: 'var(--page-bg)' }}>
      <div className="flex flex-col lg:flex-row gap-6">

        {/* ══ LEFT: Menu Area ══ */}
        <div className="flex-1 min-w-0">

          <div className="bg-[#111827] rounded-xl shadow-lg p-5 mb-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-white border border-slate-800">
            <div>
              <h1 className="text-sm font-black uppercase tracking-widest text-white flex items-center gap-2">
                POS Terminal <span className="text-[10px] bg-amber-400 text-slate-950 px-2 py-0.5 rounded font-black">PRO V2</span>
              </h1>
              <p className="text-xs text-slate-400 font-medium mt-0.5">Select menu items below to generate tickets & orders seamlessly.</p>
            </div>
            <div className="flex items-center gap-2 bg-emerald-500/10 text-emerald-400 px-3 py-1.5 rounded-lg text-xs font-bold border border-emerald-500/20">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Terminal Online
            </div>
          </div>

          {searchTerm && (
            <div className="bg-white px-4 py-3 rounded-lg border border-slate-200 mb-4 text-xs text-slate-500 flex items-center justify-between shadow-sm">
              <span>Found <strong className="text-slate-900 font-bold">{filtered.length}</strong> result{filtered.length !== 1 ? 's' : ''} for <span className="font-bold text-slate-900">"{searchTerm}"</span></span>
            </div>
          )}

          <div className="flex items-center gap-2 mb-5 overflow-x-auto pb-2 -mx-1 px-1 [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-thumb]:rounded-full">
            {categoryTabs.map(cat => {
              const isActive = activeCategory === cat;
              return (
                <button key={cat} onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider whitespace-nowrap transition-all duration-200 flex items-center gap-2 flex-shrink-0 shadow-sm ${
                    isActive
                      ? 'bg-amber-400 text-slate-950 shadow-md font-black'
                      : 'bg-white border border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                  }`}>
                  <CategoryIcon category={cat} size={15} className={isActive ? 'text-slate-950' : 'text-slate-400'} />
                  {cat}
                </button>
              );
            })}
          </div>

          {filtered.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col items-center justify-center py-24 text-slate-400">
              <div className="w-16 h-16 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 mb-3 shadow-inner">
                <LuSearch size={28} />
              </div>
              <p className="text-xs font-black uppercase tracking-widest text-slate-700">No items found</p>
              <p className="text-xs text-slate-400 mt-1">Try searching with a different keyword or category</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {filtered.map(product => {
                const qty        = cartQty(product.id);
                const catName    = product.category?.name || '';
                const discounted = hasDiscount(product.price, product.discount_price, product.discount_expires_at);
                const finalPrice = getFinalPrice(product.price, product.discount_price, product.discount_expires_at);
                const discPct    = getDiscountPercent(product.price, product.discount_price, product.discount_expires_at);
                const expiry     = discounted ? getDiscountExpiryLabel(product.discount_expires_at) : null;
                const imageUrl   = getImageUrl(product.image);

                return (
                  <button
                    key={product.id}
                    onClick={() => addToCart(product)}
                    className={`bg-white rounded-xl border text-left transition-all duration-300 group relative flex flex-col items-center p-4 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 ${
                      qty > 0
                        ? 'border-emerald-500 ring-2 ring-emerald-500/20 bg-gradient-to-b from-emerald-50/30 to-white'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {discPct && (
                      <span className="absolute top-2.5 left-2.5 bg-amber-400 text-amber-950 text-[9px] font-black px-2 py-0.5 rounded flex items-center gap-1 shadow-sm z-10">
                        <LuFlame size={10} className="fill-amber-950" /> {discPct}
                      </span>
                    )}

                    {expiry && (
                      <span className={`absolute bottom-2.5 left-2.5 text-[8px] font-black px-1.5 py-0.5 rounded flex items-center gap-1 shadow-sm z-10 ${
                        expiry.urgent ? 'bg-rose-600 text-white' : 'bg-slate-900/80 text-white'
                      }`}>
                        <LuClock size={9} /> {expiry.label}
                      </span>
                    )}

                    {qty > 0 && (
                      <span className="absolute top-2.5 right-2.5 w-6 h-6 rounded-lg bg-slate-900 text-amber-300 text-[11px] font-black flex items-center justify-center shadow z-10 animate-bounce">
                        {qty}
                      </span>
                    )}

                    <div className="relative w-20 h-20 my-1 rounded-full p-0.5 bg-gradient-to-tr from-emerald-400 to-teal-300 shadow-md group-hover:scale-105 transition-transform duration-300 flex-shrink-0">
                      <div className="w-full h-full rounded-full overflow-hidden bg-slate-100 flex items-center justify-center relative">
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; }}
                          />
                        ) : (
                          <CategoryIcon category={catName} size={28} className="text-slate-400" />
                        )}
                      </div>
                    </div>

                    <div className="text-center mt-2.5 w-full">
                      <h3 className="text-xs font-black text-slate-900 leading-snug line-clamp-1 group-hover:text-emerald-700 transition-colors px-1">
                        {product.name}
                      </h3>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mt-0.5">
                        {catName || 'General'}
                      </span>

                      <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-center gap-2 w-full">
                        {discounted ? (
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] text-slate-400 line-through font-bold">{fmt(product.price, currency)}</span>
                            <span className="text-rose-600 font-black text-xs">{fmt(finalPrice, currency)}</span>
                          </div>
                        ) : (
                          <span className="text-slate-900 font-black text-xs">{fmt(product.price, currency)}</span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* ══ RIGHT: Current Order Cart Area ══ */}
        <div className="w-full lg:w-[420px] flex-shrink-0">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl lg:sticky lg:top-6 flex flex-col overflow-hidden" style={{ maxHeight: 'calc(100vh - 48px)' }}>

            <div className="bg-[#111827] text-white p-4 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-400/10 flex items-center justify-center text-amber-300">
                  <LuShoppingCart size={16} />
                </div>
                <div>
                  <h2 className="text-xs font-black uppercase tracking-widest">Current Order</h2>
                  <p className="text-[9px] text-slate-400">Manage cart items & checkout</p>
                </div>
              </div>
              <span className="bg-amber-400 text-slate-950 text-[10px] font-black rounded px-2.5 py-1">
                {totalItems} items
              </span>
            </div>

            <div className="p-3.5 border-b border-slate-100 bg-slate-50/50">
              <div className="flex gap-2">
                {settings.table_service !== false && (
                  <button
                    onClick={() => setOrderType('dine-in')}
                    className={`flex-1 py-2.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all shadow-sm ${
                      orderType === 'dine-in' ? 'bg-[#111827] text-amber-300' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}>
                    Dine-In
                  </button>
                )}
                {settings.takeaway !== false && (
                  <button
                    onClick={() => { setOrderType('takeaway'); setTableId(''); }}
                    className={`flex-1 py-2.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all shadow-sm ${
                      orderType === 'takeaway' ? 'bg-[#111827] text-amber-300' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}>
                    Takeaway
                  </button>
                )}
              </div>
              {settings.table_service !== false && orderType === 'dine-in' && (
                <select value={tableId} onChange={e => setTableId(e.target.value)}
                  className="w-full mt-2.5 border border-slate-200 rounded-lg px-3 py-2.5 text-xs font-bold text-slate-900 bg-white focus:outline-none focus:border-slate-900">
                  <option value="">Select table number…</option>
                  {AVAILABLE_TABLES.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center py-20 text-slate-300">
                  <div className="w-14 h-14 rounded-xl bg-slate-50 flex items-center justify-center text-slate-300 mb-2">
                    <LuPackage size={26} />
                  </div>
                  <p className="text-xs font-black uppercase tracking-widest text-slate-400">Cart is empty</p>
                  <p className="text-[11px] text-slate-300 mt-1">Select menu items to begin transaction</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {cart.map(item => {
                    const fp   = getFinalPrice(item.price, item.discount_price, item.discount_expires_at);
                    const disc = hasDiscount(item.price, item.discount_price, item.discount_expires_at);
                    const imageUrl = getImageUrl(item.image);
                    return (
                      <div key={item.id} className="bg-slate-50/80 border border-slate-200/90 rounded-xl p-3 flex items-center gap-3 shadow-sm hover:border-slate-300 transition-all">
                        <div className="w-12 h-12 rounded-lg bg-slate-100 overflow-hidden flex items-center justify-center flex-shrink-0 border border-slate-200">
                          {imageUrl ? (
                            <img src={imageUrl} alt={item.name} className="w-full h-full object-cover" />
                          ) : (
                            <CategoryIcon category={item.category?.name} size={18} className="text-slate-400" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-bold text-slate-900 truncate">{item.name}</h4>
                          <div className="flex items-center gap-2 mt-0.5">
                            {disc && <span className="text-[10px] text-slate-400 line-through">{fmt(item.price, currency)}</span>}
                            <span className={`text-xs font-black ${disc ? 'text-rose-600' : 'text-emerald-700'}`}>{fmt(fp, currency)}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg p-1 shadow-sm">
                          <button onClick={() => updateQty(item.id, -1)} className="w-6 h-6 flex items-center justify-center rounded bg-slate-50 text-slate-600 hover:bg-slate-100">
                            <LuMinus size={11} />
                          </button>
                          <span className="text-xs font-black text-slate-900 w-5 text-center">{item.qty}</span>
                          <button onClick={() => updateQty(item.id, 1)} className="w-6 h-6 flex items-center justify-center rounded bg-slate-50 text-slate-600 hover:bg-slate-100">
                            <LuPlus size={11} />
                          </button>
                        </div>

                        <button onClick={() => removeItem(item.id)} className="text-slate-300 hover:text-rose-500 p-1 transition-colors">
                          <LuTrash2 size={15} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-100 bg-white space-y-3 shadow-md">
              <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Add kitchen or order notes..." rows={2}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-slate-900 resize-none bg-slate-50/50" />

              {cart.length > 0 && (
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0 border border-amber-200">
                    <LuTag size={14} />
                  </div>
                  <div className="flex flex-1 border border-slate-200 rounded-lg overflow-hidden bg-slate-50/50">
                    <button
                      onClick={() => setDiscountType(t => t === '%' ? '$' : '%')}
                      className="px-3 py-1.5 bg-white text-xs font-black text-slate-600 border-r border-slate-200">
                      {discountType}
                    </button>
                    <input
                      type="number" min="0" placeholder="Staff discount"
                      value={discountValue}
                      onChange={e => setDiscountValue(e.target.value)}
                      className="flex-1 px-3 py-1.5 text-xs bg-transparent focus:outline-none font-bold text-slate-900"
                    />
                    {discountValue && (
                      <button onClick={() => setDiscountValue('')}
                        className="px-2.5 text-slate-400 hover:text-slate-600"><LuX size={12} /></button>
                    )}
                  </div>
                </div>
              )}

              {cart.length > 0 ? (
                <div className="space-y-1.5 text-xs bg-slate-50 p-3 rounded-lg border border-slate-200/80">
                  <div className="flex justify-between text-slate-400 font-medium">
                    <span className="uppercase font-black tracking-wider text-[10px]">Subtotal</span>
                    <span>{fmt(subtotal, currency)}</span>
                  </div>
                  {discountAmt > 0 && (
                    <div className="flex justify-between text-rose-600 font-bold">
                      <span className="text-[10px] uppercase tracking-wider font-black">Discount</span>
                      <span>-{fmt(discountAmt, currency)}</span>
                    </div>
                  )}
                  {showTax && taxAmt > 0 && (
                    <div className="flex justify-between text-slate-600 font-bold">
                      <span className="text-[10px] uppercase tracking-wider font-black">Tax ({taxRate}%)</span>
                      <span>{fmt(taxAmt, currency)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-base font-black text-slate-900 pt-2 border-t border-slate-200">
                    <span className="text-xs uppercase tracking-wider font-black text-slate-500 self-center">Total Amount</span>
                    <span className="text-emerald-700 text-lg">{fmt(grandTotal, currency)}</span>
                  </div>
                </div>
              ) : (
                <div className="flex justify-between items-center bg-slate-50 p-3 rounded-lg border border-slate-200/80">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-400">Total Amount</span>
                  <span className="text-base font-black text-slate-900">{fmt(0, currency)}</span>
                </div>
              )}

              <button
                onClick={() => canPlace && setShowPayment(true)}
                disabled={!canPlace}
                className={`w-full py-3.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-md flex items-center justify-center gap-2 ${
                  canPlace ? 'bg-[#111827] text-amber-300 hover:bg-black' : 'bg-slate-100 text-slate-300 cursor-not-allowed'
                }`}>
                Proceed to Checkout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ══ PAYMENT MODAL ══ */}
      {showPayment && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden border border-slate-100">

            <div className="bg-[#111827] text-white px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <LuBanknote size={18} className="text-amber-300" />
                <h2 className="font-black uppercase tracking-widest text-xs">Payment & Checkout</h2>
              </div>
              <button onClick={() => { if (!isPlacing) setShowPayment(false); }} className="text-white/60 hover:text-white">
                <LuX size={18} />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {isTestPay && (
                <div className="bg-amber-50 border border-dashed border-amber-300 rounded-xl p-3 flex items-center gap-2.5 text-amber-700">
                  <LuFlaskConical size={16} className="flex-shrink-0" />
                  <p className="text-[11px] font-bold leading-snug">
                    Demo mode — this places a real order but skips actual payment collection. Use for staff training only.
                  </p>
                </div>
              )}

              <div className="bg-slate-50 rounded-xl p-4 space-y-2 text-xs border border-slate-200">
                <div className="flex justify-between text-slate-500">
                  <span>Items count:</span>
                  <span className="font-bold text-slate-900">{totalItems} units</span>
                </div>
                {discountAmt > 0 && (
                  <div className="flex justify-between text-rose-600 font-bold">
                    <span>Discount applied:</span>
                    <span>-{fmt(discountAmt, currency)}</span>
                  </div>
                )}
                {showTax && taxAmt > 0 && (
                  <div className="flex justify-between text-slate-600 font-bold">
                    <span>Tax ({taxRate}%):</span>
                    <span>{fmt(taxAmt, currency)}</span>
                  </div>
                )}
                <div className="border-t border-slate-200 pt-2 flex justify-between font-black text-slate-900 text-base">
                  <span>Grand Total</span>
                  <span className="text-emerald-700">{fmt(grandTotal, currency)}</span>
                </div>
              </div>

              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Select Payment Method</p>
                <div className={`grid gap-2 ${ENABLE_TEST_PAYMENT ? 'grid-cols-2' : 'grid-cols-3'}`}>
                  {PAYMENT_METHODS.map(m => {
                    const Icon = m.icon;
                    return (
                      <button key={m.id} onClick={() => { setPaymentMethod(m.id); setCashReceived(''); }}
                        disabled={isPlacing}
                        className={`py-3 rounded-xl flex flex-col items-center gap-1.5 text-xs font-black uppercase tracking-wider transition-all shadow-sm ${
                          paymentMethod === m.id
                            ? (m.id === 'test' ? 'bg-amber-500 text-white' : 'bg-[#111827] text-amber-300')
                            : 'bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}>
                        <Icon size={18} />{m.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {paymentMethod === 'cash' && (
                <div className="space-y-3">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5">Cash Received</p>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-slate-400 text-base">
                        {currency === 'KHR' ? '៛' : currency === 'THB' ? '฿' : '$'}
                      </span>
                      <input
                        ref={cashInputRef}
                        type="number" min="0" step="0.01"
                        placeholder={grandTotal.toFixed(2)}
                        value={cashReceived}
                        onChange={e => setCashReceived(e.target.value)}
                        disabled={isPlacing}
                        className="w-full border border-slate-200 rounded-xl pl-9 pr-4 py-3 text-lg font-black text-slate-900 bg-slate-50/50 focus:outline-none focus:border-slate-900"
                      />
                    </div>
                  </div>

                  {cashNum > 0 && (
                    <div className={`rounded-xl p-3.5 text-center transition-all ${cashNum >= grandTotal ? 'bg-emerald-50 border border-emerald-200' : 'bg-rose-50 border border-rose-200'}`}>
                      {cashNum >= grandTotal ? (
                        <>
                          <p className="text-[10px] font-black uppercase tracking-widest text-emerald-700">Change Due</p>
                          <p className="text-2xl font-black text-emerald-700">{fmt(change, currency)}</p>
                        </>
                      ) : (
                        <>
                          <p className="text-[10px] font-black uppercase tracking-widest text-rose-600">Remaining Balance</p>
                          <p className="text-2xl font-black text-rose-600">{fmt(grandTotal - cashNum, currency)}</p>
                        </>
                      )}
                    </div>
                  )}
                </div>
              )}

              {paymentMethod === 'card' && (
                <div className="bg-sky-50 border border-sky-100 rounded-xl p-4 text-center text-xs text-sky-700 font-bold">
                  Please process card settlement on terminal.
                </div>
              )}

              {paymentMethod === 'khqr' && (
                <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 text-center text-xs text-amber-800 font-bold flex items-center gap-2.5">
                  <LuQrCode size={20} className="flex-shrink-0" />
                  <span>Tap "Generate QR" below to show a live KHQR code for the customer to scan with their banking app.</span>
                </div>
              )}

              {paymentMethod === 'test' && (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-center text-xs text-slate-500 font-bold">
                  No payment collection needed — clicking confirm will simulate a successful cash payment.
                </div>
              )}

              {placeError && (
                <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 text-center text-xs text-rose-600 font-bold">
                  {placeError}
                </div>
              )}

              <button
                onClick={handlePlaceOrder}
                disabled={!cashValid || placed || isPlacing}
                className={`w-full py-4 rounded-xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 transition-all shadow-md ${
                  placed ? 'bg-emerald-600 text-white' :
                  (cashValid && !isPlacing) ? (isTestPay ? 'bg-amber-500 text-white hover:bg-amber-600' : 'bg-[#111827] text-amber-300 hover:bg-black') :
                  'bg-slate-100 text-slate-300 cursor-not-allowed'
                }`}>
                {placed
                  ? <><LuCheck size={16} /> Order Successfully Placed!</>
                  : isPlacing
                  ? <><FaSpinner className="animate-spin" size={16} /> Saving Order...</>
                  : isKhqrPay
                  ? <><LuQrCode size={16} /> Generate QR & Wait for Payment</>
                  : <><LuPrinter size={16} /> {isTestPay ? 'Confirm Demo & Print' : 'Confirm & Print Receipt'}</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══ KHQR SCAN MODAL ══ */}
      <POSKhqrModal
        isOpen={showKhqrScan}
        onClose={handleKhqrClose}
        orderId={pendingOrder?.id}
        amount={grandTotal}
        onPaid={handleKhqrPaid}
      />
    </div>
  );
};

export default ManagementSaler;