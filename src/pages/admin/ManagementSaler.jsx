import React, { useState } from 'react';
import { LuPlus, LuMinus, LuTrash2, LuShoppingCart, LuUtensilsCrossed, LuPackage, LuCheck } from 'react-icons/lu';

const CATEGORIES = ['All', 'Soup', 'Curry', 'Grill', 'Drinks', 'Dessert'];

const PRODUCTS = [
  { id: 1, name: 'Fish Amok', category: 'Curry', price: 6.5 },
  { id: 2, name: 'Khmer Beef Curry', category: 'Curry', price: 7.0 },
  { id: 3, name: 'Sour Soup (Samlor Machu)', category: 'Soup', price: 5.0 },
  { id: 4, name: 'Chicken Soup', category: 'Soup', price: 4.5 },
  { id: 5, name: 'Grilled Pork Skewers', category: 'Grill', price: 5.5 },
  { id: 6, name: 'Lemongrass Chicken', category: 'Grill', price: 6.0 },
  { id: 7, name: 'Iced Lemongrass Tea', category: 'Drinks', price: 1.5 },
  { id: 8, name: 'Sugarcane Juice', category: 'Drinks', price: 1.8 },
  { id: 9, name: 'Sticky Rice & Mango', category: 'Dessert', price: 3.0 },
  { id: 10, name: 'Coconut Pudding', category: 'Dessert', price: 2.5 },
];

const AVAILABLE_TABLES = [
  { id: 1, name: 'Table 01' },
  { id: 3, name: 'Table 03' },
  { id: 5, name: 'Table 05' },
  { id: 7, name: 'Table 07' },
];

const ManagementSaler = () => {
  const [activeCategory, setActiveCategory] = useState('All');
  const [orderType, setOrderType] = useState('dine-in');
  const [tableId, setTableId] = useState('');
  const [cart, setCart] = useState([]);
  const [notes, setNotes] = useState('');
  const [placed, setPlaced] = useState(false);

  const filtered = activeCategory === 'All' ? PRODUCTS : PRODUCTS.filter((p) => p.category === activeCategory);

  const addToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === product.id);
      if (existing) return prev.map((i) => (i.id === product.id ? { ...i, qty: i.qty + 1 } : i));
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const updateQty = (id, delta) => {
    setCart((prev) => prev.map((i) => (i.id === id ? { ...i, qty: i.qty + delta } : i)).filter((i) => i.qty > 0));
  };

  const removeItem = (id) => setCart((prev) => prev.filter((i) => i.id !== id));

  const total = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  const canPlaceOrder = cart.length > 0 && (orderType === 'takeaway' || tableId);

  const handlePlaceOrder = () => {
    if (!canPlaceOrder) return;
    setPlaced(true);
    setTimeout(() => setPlaced(false), 2000);
    setCart([]);
    setNotes('');
    setTableId('');
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD]">
      <div className="p-8 flex gap-6">
        {/* Left: Menu */}
        <div className="flex-1">
          <div className="mb-6">
            <p className="text-xs text-gray-400 font-black uppercase tracking-widest mt-1">
              Create a new order for dine-in or takeaway
            </p>
          </div>

          <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-sm text-xs font-black uppercase tracking-widest whitespace-nowrap transition-colors ${
                  activeCategory === cat
                    ? 'bg-[#1c2e35] text-[#ffcc33]'
                    : 'bg-white border border-gray-100 text-gray-400 hover:text-[#1a2e35]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {filtered.map((product) => (
              <button
                key={product.id}
                onClick={() => addToCart(product)}
                className="bg-white rounded-sm border border-gray-100 shadow-sm p-4 text-left hover:border-[#4ade80]/50 hover:shadow-md transition-all group"
              >
                <div className="w-10 h-10 rounded-sm bg-[#1c2e35] flex items-center justify-center mb-3 group-hover:bg-[#2a3f32] transition-colors">
                  <LuUtensilsCrossed size={18} className="text-[#4ade80]" />
                </div>
                <h3 className="text-sm font-bold text-[#1a2e35] leading-snug">{product.name}</h3>
                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-1">{product.category}</p>
                <p className="text-[#2D4A22] font-black mt-2">${product.price.toFixed(2)}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Right: Cart */}
        <div className="w-96 flex-shrink-0">
          <div className="bg-white rounded-sm border border-gray-100 shadow-sm sticky top-24 flex flex-col" style={{ maxHeight: 'calc(100vh - 120px)' }}>
            <div className="bg-[#1c2e35] text-white p-5 flex items-center gap-3">
              <LuShoppingCart size={18} />
              <h2 className="text-sm font-black uppercase tracking-widest">Current Order</h2>
            </div>

            <div className="p-5 border-b border-gray-50">
              <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-2">Order Type</p>
              <div className="flex gap-2">
                {['dine-in', 'takeaway'].map((type) => (
                  <button
                    key={type}
                    onClick={() => { setOrderType(type); if (type === 'takeaway') setTableId(''); }}
                    className={`flex-1 py-2 rounded-sm text-xs font-black uppercase tracking-widest transition-colors ${
                      orderType === type ? 'bg-[#1a2e35] text-[#ffcc33]' : 'bg-gray-50 text-gray-400 hover:text-[#1a2e35]'
                    }`}
                  >
                    {type === 'dine-in' ? 'Dine-In' : 'Takeaway'}
                  </button>
                ))}
              </div>
              {orderType === 'dine-in' && (
                <select
                  value={tableId}
                  onChange={(e) => setTableId(e.target.value)}
                  className="w-full mt-3 border border-gray-100 rounded-sm px-3 py-2 text-sm font-bold text-[#1a2e35] focus:outline-none focus:border-[#4ade80]"
                >
                  <option value="">Select a table…</option>
                  {AVAILABLE_TABLES.map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-3">
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center py-12 text-gray-300">
                  <LuPackage size={28} className="mb-2" />
                  <p className="text-xs font-black uppercase tracking-widest">Cart is empty</p>
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.id} className="flex items-center justify-between gap-3">
                    <div className="flex-1">
                      <p className="text-sm font-bold text-[#1a2e35] leading-tight">{item.name}</p>
                      <p className="text-xs text-gray-400 font-bold">${item.price.toFixed(2)} each</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => updateQty(item.id, -1)} className="w-6 h-6 flex items-center justify-center rounded-sm bg-gray-50 text-gray-500 hover:bg-gray-100"><LuMinus size={12} /></button>
                      <span className="text-sm font-black text-[#1a2e35] w-4 text-center">{item.qty}</span>
                      <button onClick={() => updateQty(item.id, 1)} className="w-6 h-6 flex items-center justify-center rounded-sm bg-gray-50 text-gray-500 hover:bg-gray-100"><LuPlus size={12} /></button>
                    </div>
                    <button onClick={() => removeItem(item.id)} className="text-gray-300 hover:text-red-500 transition-colors"><LuTrash2 size={15} /></button>
                  </div>
                ))
              )}
            </div>

            <div className="p-5 border-t border-gray-50 space-y-4">
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Order notes…"
                rows={2}
                className="w-full border border-gray-100 rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-[#4ade80] resize-none"
              />
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-widest text-gray-400">Total</span>
                <span className="text-xl font-black text-[#2D4A22]">${total.toFixed(2)}</span>
              </div>
              <button
                onClick={handlePlaceOrder}
                disabled={!canPlaceOrder}
                className={`w-full py-3 rounded-sm text-sm font-black uppercase tracking-widest transition-colors flex items-center justify-center gap-2 ${
                  canPlaceOrder ? 'bg-[#1c2e35] text-[#ffcc33] hover:bg-[#2a3f32]' : 'bg-gray-100 text-gray-300 cursor-not-allowed'
                }`}
              >
                {placed ? <><LuCheck size={16} /> Order Placed</> : 'Place Order'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagementSaler;