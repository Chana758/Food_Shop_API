import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaShoppingCart, FaTrash, FaMinus, FaPlus, FaArrowLeft, FaTag } from 'react-icons/fa';
import { MdDeliveryDining, MdOutlineReceiptLong, MdCheckCircle } from 'react-icons/md';
import usePricing from '../../hooks/usePricing';
import { getImageUrl } from '../../utils/imageUrl';

const FALLBACK_IMG = 'https://placehold.co/400x300?text=Khmer+Fresh';

const isLoggedIn = () =>
  !!(localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser'));

const Cart = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);

  const pricing = usePricing() || {};
  const DELIVERY_FEE = Number(pricing.delivery_fee ?? 2);
  const FREE_THRESHOLD = Number(pricing.free_delivery_threshold ?? 20);

  useEffect(() => {
    if (!isLoggedIn()) {
      navigate('/login');
      return;
    }
    loadCart();
  }, [navigate]);

  const loadCart = () => {
    const storedCart = localStorage.getItem('cart');
    if (storedCart) {
      const parsed = JSON.parse(storedCart);
      setCartItems(parsed);
      setSelectedItems(parsed.map(item => `${item.id}-${item.type}`));
    }
  };

  // ======= SELECTION LOGIC ========

  const toggleItemSelection = (itemId, itemType) => {
    const itemKey = `${itemId}-${itemType}`;
    setSelectedItems(prev =>
      prev.includes(itemKey) ? prev.filter(key => key !== itemKey) : [...prev, itemKey]
    );
  };

  const isItemSelected = (itemId, itemType) =>
    selectedItems.includes(`${itemId}-${itemType}`);

  const toggleSelectAll = () => {
    if (selectedItems.length === cartItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(cartItems.map(item => `${item.id}-${item.type}`));
    }
  };

  const isAllSelected = () =>
    cartItems.length > 0 && selectedItems.length === cartItems.length;

  // ====== QUANTITY LOGIC =======

  const updateQuantity = (itemId, itemType, newQuantity) => {
    if (newQuantity < 1) return;
    const updatedCart = cartItems.map(item =>
      item.id === itemId && item.type === itemType
        ? { ...item, quantity: newQuantity }
        : item
    );
    setCartItems(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const handleQuantityInput = (itemId, itemType, value) => {
    const numValue = parseInt(value);
    if (!isNaN(numValue) && numValue > 0) {
      updateQuantity(itemId, itemType, numValue);
    } else if (value === '') {
      setCartItems(cartItems.map(item =>
        item.id === itemId && item.type === itemType ? { ...item, quantity: '' } : item
      ));
    }
  };

  const handleQuantityBlur = (itemId, itemType, currentQty) => {
    if (currentQty === '' || currentQty < 1) {
      updateQuantity(itemId, itemType, 1);
    }
  };

  // ===== REMOVE / CLEAR ========

  const removeFromCart = (itemId, itemType) => {
    const updatedCart = cartItems.filter(
      item => !(item.id === itemId && item.type === itemType)
    );
    setCartItems(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    const itemKey = `${itemId}-${itemType}`;
    setSelectedItems(prev => prev.filter(key => key !== itemKey));
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const clearCart = () => {
    if (window.confirm('Are you sure you want to clear your entire cart?')) {
      setCartItems([]);
      setSelectedItems([]);
      localStorage.removeItem('cart');
      window.dispatchEvent(new Event('cartUpdated'));
    }
  };

  // ==== PRICE CALCULATIONS ======

  const calculateSubtotal = () => {
    const subtotal = cartItems
      .filter(item => isItemSelected(item.id, item.type))
      .reduce((total, item) => {
        const price = parseFloat(item.price) || 0;
        const quantity = parseInt(item.quantity) || 0;
        return total + price * quantity;
      }, 0);
    return subtotal.toFixed(2);
  };

  const getDeliveryFee = () => {
    const subtotal = parseFloat(calculateSubtotal());
    if (subtotal <= 0 || selectedItems.length === 0) return 0;
    if (subtotal >= FREE_THRESHOLD) return 0;
    return DELIVERY_FEE;
  };

  const calculateTotal = () => {
    const subtotal = parseFloat(calculateSubtotal());
    return (subtotal + getDeliveryFee()).toFixed(2);
  };

  // ==== CHECKOUT =====

  const handleProceedToCheckout = () => {
    if (selectedItems.length === 0) {
      alert('Please select at least one item to proceed to checkout!');
      return;
    }
    localStorage.setItem('selectedItems', JSON.stringify(selectedItems));
    navigate('/checkout');
  };

  // ===== FREE DELIVERY PROGRESS =======

  const getFreeDeliveryProgress = () => {
    const subtotal = parseFloat(calculateSubtotal());
    return Math.min((subtotal / FREE_THRESHOLD) * 100, 100);
  };

  const getRemainingForFreeDelivery = () => {
    const remaining = FREE_THRESHOLD - parseFloat(calculateSubtotal());
    return remaining > 0 ? remaining.toFixed(2) : '0.00';
  };

  // === EMPTY STATE ====

  if (cartItems.length === 0) {
    return (
      <div className="w-full min-h-screen bg-[#FDFDFD] flex items-center justify-center pt-20 px-6">
        <div className="max-w-md mx-auto text-center">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-gray-100 shadow-sm">
            <FaShoppingCart className="text-2xl text-gray-300" />
          </div>
          <h2 className="text-xl font-black text-[#2D4A22] uppercase tracking-widest mb-3">
            Your cart is empty
          </h2>
          <p className="text-gray-400 text-xs uppercase tracking-widest mb-8 leading-loose">
            It looks like you haven't added any delicious meals yet. Start exploring our menu today!
          </p>
          <Link
            to="/MenuFood"
            className="block w-full bg-[#2D4A22] text-white py-4 px-8 font-black text-[10px] uppercase tracking-[0.2em] hover:bg-[#1e3317] transition-all shadow-lg shadow-[#2D4A22]/20 text-center"
          >
            Browse Menu
          </Link>
        </div>
      </div>
    );
  }

  const subtotal = calculateSubtotal();
  const deliveryFee = getDeliveryFee();
  const total = calculateTotal();
  const progress = getFreeDeliveryProgress();
  const remaining = getRemainingForFreeDelivery();
  const freeDeliveryUnlocked = parseFloat(subtotal) >= FREE_THRESHOLD;

  // === MAIN CART UI ====

  return (
    <div className="w-full min-h-screen bg-[#FDFDFD] pt-32 pb-20 px-6 md:px-14">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 border-b border-gray-100 pb-10 gap-6">
          <div>
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-[#2D4A22] font-black text-[10px] uppercase tracking-[0.3em] hover:text-[#F58220] transition-colors mb-6 group"
            >
              <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" /> Back
            </button>
            <h1 className="text-4xl font-black text-[#2D4A22] uppercase tracking-tighter">
              My Shopping <span className="text-[#F58220]">Cart</span>
            </h1>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mt-2">
              You have {cartItems.length} item{cartItems.length !== 1 ? 's' : ''} in your list
            </p>
          </div>
          <button
            onClick={clearCart}
            className="text-[10px] font-black text-red-400 uppercase tracking-widest hover:text-red-600 flex items-center gap-2 transition-colors"
          >
            <FaTrash size={10} /> Clear All Items
          </button>
        </div>

        <div className="grid lg:grid-cols-12 gap-16">

          {/* LEFT: CART ITEMS */}
          <div className="lg:col-span-8 space-y-3">

            {/* Select-all row */}
            <div className="flex items-center gap-4 py-2 border-b border-gray-50">
              <input
                type="checkbox"
                checked={isAllSelected()}
                onChange={toggleSelectAll}
                className="w-4 h-4 accent-[#2D4A22] cursor-pointer"
              />
              <span className="text-[10px] font-black text-[#2D4A22] uppercase tracking-widest">
                Select All Items ({selectedItems.length}/{cartItems.length})
              </span>
            </div>

            {cartItems.map((item) => (
              <div
                key={`${item.id}-${item.type}`}
                className={`group bg-white rounded-sm p-4 border transition-all duration-300 ${
                  isItemSelected(item.id, item.type)
                    ? 'border-[#2D4A22]/20 shadow-md'
                    : 'border-gray-100'
                }`}
              >
                <div className="flex flex-row gap-4 items-center">

                  {/* IMAGE + CHECKBOX */}
                  <div className="relative flex-shrink-0">
                    <div className="w-20 h-20 overflow-hidden bg-gray-50 border border-gray-100">
                      <img
                        src={getImageUrl(item.image, FALLBACK_IMG)}
                        alt={item.name}
                        className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all duration-500"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = FALLBACK_IMG;
                        }}
                      />
                    </div>
                    <input
                      type="checkbox"
                      checked={isItemSelected(item.id, item.type)}
                      onChange={() => toggleItemSelection(item.id, item.type)}
                      className="absolute -top-1.5 -left-1.5 w-4 h-4 accent-[#2D4A22] shadow-sm cursor-pointer"
                    />
                  </div>

                  {/* ITEM DETAILS */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-2">
                      <div className="min-w-0">
                        <span className="text-[8px] uppercase font-black tracking-[0.2em] text-[#F58220]">
                          {typeof item.category === 'object' ? item.category?.name : item.category}
                        </span>
                        <h3 className="text-sm font-black text-[#2D4A22] uppercase tracking-tight mt-0.5 truncate">
                          {item.name}
                        </h3>
                        <div className="flex items-baseline gap-2 mt-0.5">
                          <p className="text-base font-black text-[#2D4A22]">
                            ${(parseFloat(item.price) || 0).toFixed(2)}
                          </p>
                          {Number(item.originalPrice) > Number(item.price) && (
                            <span className="text-[10px] text-gray-400 line-through">
                              ${Number(item.originalPrice).toFixed(2)}
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id, item.type)}
                        className="text-gray-300 hover:text-red-500 transition-colors flex-shrink-0"
                        title="Remove item"
                      >
                        <FaTrash size={12} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center border border-gray-200 rounded-sm overflow-hidden">
                        <button
                          onClick={() => updateQuantity(item.id, item.type, (item.quantity || 1) - 1)}
                          className="px-2.5 py-1.5 hover:bg-gray-50 transition-colors border-r border-gray-200 disabled:opacity-30"
                          disabled={item.quantity <= 1}
                          title="Decrease"
                        >
                          <FaMinus size={7} />
                        </button>
                        <input
                          type="text"
                          value={item.quantity}
                          onChange={(e) => handleQuantityInput(item.id, item.type, e.target.value)}
                          onBlur={() => handleQuantityBlur(item.id, item.type, item.quantity)}
                          className="w-8 text-center text-[10px] font-black text-[#2D4A22] outline-none py-1.5"
                        />
                        <button
                          onClick={() => updateQuantity(item.id, item.type, (item.quantity || 0) + 1)}
                          className="px-2.5 py-1.5 hover:bg-gray-50 transition-colors border-l border-gray-200"
                          title="Increase"
                        >
                          <FaPlus size={7} />
                        </button>
                      </div>

                      <div className="text-right">
                        <p className="text-[8px] text-gray-400 font-black uppercase tracking-tighter">
                          Subtotal
                        </p>
                        <p className="text-sm font-black text-[#2D4A22]">
                          ${((parseFloat(item.price) || 0) * (parseInt(item.quantity) || 0)).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            ))}
          </div>

          {/* RIGHT: ORDER SUMMARY */}
          <div className="lg:col-span-4">
            <div className="bg-gray-50 p-8 rounded-sm sticky top-32">

              <h2 className="text-xs font-black text-[#2a6a12] uppercase tracking-[0.3em] mb-10 border-b border-gray-200 pb-4 flex items-center gap-2">
                <MdOutlineReceiptLong size={16} /> Summary
              </h2>

              <div className="space-y-6 mb-10">
                <div className="flex justify-between text-[11px] font-bold text-gray-500 uppercase tracking-widest">
                  <span>
                    Cart Subtotal{' '}
                    <span className="text-gray-400 normal-case font-normal">
                      ({selectedItems.length} selected)
                    </span>
                  </span>
                  <span className="text-[#2D4A22]">${subtotal}</span>
                </div>

                <div className="flex justify-between text-[11px] font-bold text-gray-500 uppercase tracking-widest">
                  <span className="flex items-center gap-2">
                    <MdDeliveryDining size={16} className="text-[#F58220]" /> Delivery Fee
                  </span>
                  <span
                    className={
                      deliveryFee === 0 && parseFloat(subtotal) > 0
                        ? 'text-green-500'
                        : 'text-[#2D4A22]'
                    }
                  >
                    {deliveryFee === 0 && parseFloat(subtotal) > 0
                      ? 'FREE'
                      : `$${deliveryFee.toFixed(2)}`}
                  </span>
                </div>

                <div className="border-t border-gray-200 pt-6">
                  <div className="flex justify-between items-end">
                    <span className="text-[10px] font-black text-[#2D4A22] uppercase tracking-[0.2em]">
                      Grand Total
                    </span>
                    <span className="text-3xl font-black text-[#2D4A22]">${total}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleProceedToCheckout}
                className="w-full bg-[#2D4A22] text-white py-4 px-6 font-black text-[11px] uppercase tracking-[0.2em] hover:bg-orange-500 transition-all shadow-lg shadow-[#2D4A22]/20 mb-6 disabled:opacity-40 disabled:cursor-not-allowed"
                disabled={selectedItems.length === 0}
              >
                Checkout Now
              </button>

              <Link
                to="/MenuFood"
                className="block text-center text-gray-400 hover:text-[#2D4A22] font-black text-[9px] uppercase tracking-widest transition-colors"
              >
                ← Continue Shopping
              </Link>

              {/* Free Delivery Progress Bar */}
              <div className="mt-12 p-5 bg-white border border-gray-100 rounded-sm relative overflow-hidden">
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[10px] font-black text-[#2D4A22] uppercase tracking-widest flex items-center gap-1">
                      <FaTag size={9} /> Special Offer
                    </p>
                    {freeDeliveryUnlocked && (
                      <MdCheckCircle className="text-green-500" size={14} />
                    )}
                  </div>

                  {freeDeliveryUnlocked ? (
                    <p className="text-[9px] text-green-500 font-black uppercase tracking-tighter">
                      🎉 You've unlocked free delivery!
                    </p>
                  ) : (
                    <p className="text-[9px] text-gray-400 leading-relaxed font-bold uppercase tracking-tighter mb-3">
                      Add ${remaining} more for free delivery!
                    </p>
                  )}

                  <div className="mt-3 w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="h-full bg-[#F58220] rounded-full transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-[8px] text-gray-300 font-bold">$0</span>
                    <span className="text-[8px] text-gray-300 font-bold">${FREE_THRESHOLD} FREE</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;