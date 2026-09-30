import React, { useState, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  LuChevronDown, LuChevronUp, LuHeart,
  LuTrash2, LuRefreshCw, LuX, LuUsers, LuBookmarkCheck, LuDollarSign
} from 'react-icons/lu';
import axiosInstance from '../../api/axios';
import { getImageUrl } from '../../utils/imageUrl';
import { getFinalPrice, hasDiscount } from '../../utils/priceUtils';

// Adapters: helpers take (price, discount_price, discount_expires_at)
const finalPrice = (p) => getFinalPrice(p?.price, p?.discount_price, p?.discount_expires_at);
const onDiscount = (p) => hasDiscount(p?.price, p?.discount_price, p?.discount_expires_at);

const FALLBACK_IMG = 'https://placehold.co/400x300?text=Khmer+Fresh';

// Modal
const Modal = ({ onClose, children }) => (
  <div
    className="fixed inset-0 bg-slate-900/60 backdrop-blur-2xs flex items-center justify-center p-4 z-50"
    onClick={onClose}
  >
    <div
      className="bg-white rounded-xl p-6 w-full max-w-lg shadow-2xl border-2 border-slate-300 max-h-[90vh] overflow-y-auto"
      onClick={e => e.stopPropagation()}
    >
      {children}
    </div>
  </div>
);

// Solid color stat card
const StatCard = ({ icon, cardBg, label, value, sub }) => (
  <div className={`${cardBg} rounded-xl p-5 flex flex-col justify-between shadow-sm flex-1 min-w-[200px] text-white`}>
    <div className="flex items-center justify-between mb-3">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/15">
        {icon}
      </div>
      <span className="text-[10px] font-black uppercase tracking-wider text-white/70">{label}</span>
    </div>
    <div>
      <div className="text-2xl font-black tracking-tight">{value}</div>
      <p className="text-[11px] font-bold text-white/60 mt-1">{sub}</p>
    </div>
  </div>
);

const FavoriteManagement = () => {
  const { searchTerm = '' } = useOutletContext() || {};

  const [favoritesMap, setFavoritesMap] = useState({});
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);
  const [openUsers, setOpenUsers]       = useState([]);
  const [deleting, setDeleting]         = useState(null);
  const [submitting, setSubmitting]     = useState(false);

  const fetchFavorites = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await axiosInstance.get('/admin/favorites');
      setFavoritesMap(res.data.data ?? {});
    } catch (err) {
      console.error('Failed to fetch favorites:', err.response ?? err);
      setError('Failed to load favorites.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchFavorites(); }, [fetchFavorites]);

  const toggleUser  = (name) =>
    setOpenUsers(prev => prev.includes(name) ? prev.filter(u => u !== name) : [...prev, name]);
  const expandAll   = () => setOpenUsers(Object.keys(favoritesMap));
  const collapseAll = () => setOpenUsers([]);

  const handleDelete = async () => {
    if (!deleting) return;
    setSubmitting(true);
    try {
      await axiosInstance.delete(`/admin/favorites/${deleting.favoriteId}`);
      await fetchFavorites();
      setDeleting(null);
    } catch (err) {
      console.error('Failed to delete favorite:', err.response ?? err);
    } finally {
      setSubmitting(false);
    }
  };

  // Totals use the same effective price as the cards
  const sumValue = (items) =>
    items.reduce((sum, f) => sum + finalPrice(f.product), 0);

  const totalUsers = Object.keys(favoritesMap).length;
  const totalFavs  = Object.values(favoritesMap).reduce((sum, items) => sum + items.length, 0);
  const totalValue = Object.values(favoritesMap).reduce((sum, items) => sum + sumValue(items), 0);

  const filteredMap = Object.entries(favoritesMap).reduce((acc, [userName, items]) => {
    const term = searchTerm.toLowerCase();
    if (!term) { acc[userName] = items; return acc; }
    const matchUser    = userName.toLowerCase().includes(term);
    const matchedItems = items.filter(f =>
      f.product?.name?.toLowerCase().includes(term) ||
      f.product?.category?.name?.toLowerCase().includes(term)
    );
    if (matchUser)                    acc[userName] = items;
    else if (matchedItems.length > 0) acc[userName] = matchedItems;
    return acc;
  }, {});

  if (loading) return (
    <div className="p-8 flex flex-col items-center justify-center min-h-[300px] gap-3">
      <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin" />
      <p className="text-xs font-black uppercase tracking-widest text-slate-400">Loading favorites dashboard...</p>
    </div>
  );

  if (error) return (
    <div className="p-8 text-center text-rose-500 font-bold text-xs uppercase tracking-wider">
      {error}
      <button onClick={fetchFavorites} className="ml-3 underline text-slate-500 hover:text-slate-900 cursor-pointer">
        Retry
      </button>
    </div>
  );

  return (
    <div className="p-6 md:p-8 min-h-screen space-y-6" style={{ background: 'var(--page-bg)' }}>

      {/* HEADER BANNER */}
      <div className="bg-[#1E2A2E] rounded-xl p-6 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 relative overflow-hidden border-2 border-slate-300">
        <div className="absolute -right-6 -bottom-6 opacity-5 pointer-events-none">
          <LuHeart size={180} />
        </div>

        <div className="z-10">
          <div className="flex items-center gap-1.5 text-[#D99A3D] font-black text-[10px] uppercase tracking-widest mb-1">
            <LuHeart size={13} className="fill-current" /> Customer Engagement
          </div>
          <h1 className="text-lg md:text-xl font-black uppercase tracking-wide">Favorites Management</h1>
          <p className="text-xs text-slate-300 mt-0.5 font-medium max-w-md">
            Track and monitor what items customers love, save, and keep in their wishlists.
          </p>
        </div>

        <button
          onClick={fetchFavorites}
          className="z-10 bg-white/10 hover:bg-white/20 border border-white/10 text-white px-4 py-2.5 rounded-lg flex items-center gap-2 text-xs font-black uppercase tracking-widest transition cursor-pointer shadow-2xs whitespace-nowrap"
          title="Refresh Data"
        >
          <LuRefreshCw size={13} /> Refresh
        </button>
      </div>

      {/* STATS CARDS */}
      <div className="flex gap-4 flex-wrap">
        <StatCard
          icon={<LuUsers size={18} />}
          cardBg="bg-slate-900"
          label="Customers"
          value={totalUsers}
          sub="With saved items"
        />
        <StatCard
          icon={<LuBookmarkCheck size={18} />}
          cardBg="bg-rose-700"
          label="Total Saves"
          value={totalFavs}
          sub="Items wishlisted"
        />
        <StatCard
          icon={<LuDollarSign size={18} />}
          cardBg="bg-emerald-700"
          label="Wishlist Value"
          value={`$${totalValue.toFixed(2)}`}
          sub="Combined across all customers"
        />
      </div>

      {/* EXPAND / COLLAPSE */}
      <div className="flex items-center justify-start gap-2">
        <button
          onClick={expandAll}
          className="px-4 py-2.5 bg-white border-2 border-slate-300 rounded-lg text-xs font-black uppercase tracking-wider text-slate-700 hover:bg-slate-50 transition cursor-pointer shadow-2xs"
        >
          Expand All
        </button>
        <button
          onClick={collapseAll}
          className="px-4 py-2.5 bg-white border-2 border-slate-300 rounded-lg text-xs font-black uppercase tracking-wider text-slate-700 hover:bg-slate-50 transition cursor-pointer shadow-2xs"
        >
          Collapse All
        </button>
      </div>

      {/* FAVORITES LIST */}
      {Object.keys(filteredMap).length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-slate-300 rounded-xl bg-white shadow-2xs">
          <LuHeart className="mx-auto text-slate-300 mb-2" size={40} />
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest">
            {searchTerm ? `No results match "${searchTerm}"` : 'No favorites found'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {Object.entries(filteredMap).map(([userName, items]) => {
            const isOpen     = openUsers.includes(userName);
            const initials   = userName.slice(0, 2).toUpperCase();
            const totalPrice = sumValue(items);

            return (
              <div key={userName} className="bg-white border-2 border-slate-300 rounded-xl shadow-sm overflow-hidden transition-all">
                {/* User header */}
                <button
                  onClick={() => toggleUser(userName)}
                  className="w-full px-5 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-9 h-9 bg-[#1E2A2E] text-white rounded-lg flex items-center justify-center font-black text-xs shadow-2xs">
                      {initials}
                    </div>
                    <div className="text-left">
                      <p className="font-black text-slate-900 text-xs uppercase tracking-wide">{userName}</p>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">
                        {items.length} {items.length === 1 ? 'item' : 'items'} saved
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-5">
                    <div className="text-right hidden sm:block">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Wishlist Value</p>
                      <p className="text-xs font-black text-emerald-700">${totalPrice.toFixed(2)}</p>
                    </div>
                    <div className="w-6 h-6 rounded-md bg-slate-100 flex items-center justify-center text-slate-600 border border-slate-300">
                      {isOpen ? <LuChevronUp size={14} /> : <LuChevronDown size={14} />}
                    </div>
                  </div>
                </button>

                {/* Product grid */}
                {isOpen && (
                  <div className="px-5 pb-5 pt-3 border-t-2 border-slate-200 bg-slate-50">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
                      {items.map(fav => (
                        <div
                          key={fav.id}
                          className="bg-white border-2 border-slate-300 rounded-lg overflow-hidden group hover:border-slate-900 shadow-2xs transition-all"
                        >
                          <div className="relative h-28 overflow-hidden bg-slate-100 border-b border-slate-200">
                            <img
                              src={getImageUrl(fav.product?.image, FALLBACK_IMG)}
                              alt={fav.product?.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              onError={e => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src = FALLBACK_IMG;
                              }}
                            />
                            <button
                              onClick={() => setDeleting({
                                favoriteId:  fav.id,
                                productName: fav.product?.name,
                                userName,
                              })}
                              className="absolute top-2 right-2 w-6 h-6 bg-white border border-slate-300 rounded flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-50 hover:border-rose-300 cursor-pointer shadow-2xs"
                              title="Remove favorite"
                            >
                              <LuTrash2 size={12} className="text-rose-600" />
                            </button>
                          </div>
                          <div className="p-2.5">
                            {fav.product?.category?.name && (
                              <p className="text-[8px] font-black text-[#D99A3D] uppercase tracking-widest mb-0.5 truncate">
                                {fav.product.category.name}
                              </p>
                            )}
                            <p className="text-[11px] font-black text-slate-900 uppercase truncate" title={fav.product?.name}>
                              {fav.product?.name ?? '—'}
                            </p>
                            <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-slate-200">
                              <span className="text-xs font-black text-emerald-700">
                                ${finalPrice(fav.product).toFixed(2)}
                              </span>
                              {onDiscount(fav.product) && (
                                <span className="text-[9px] text-slate-400 line-through">
                                  ${Number(fav.product.price).toFixed(2)}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleting && (
        <Modal onClose={() => setDeleting(null)}>
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <h2 className="text-xs font-black uppercase text-slate-900 tracking-wider">Remove Favorite</h2>
            <button onClick={() => setDeleting(null)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
              <LuX size={16} />
            </button>
          </div>

          <div className="py-4 space-y-3 text-xs">
            <p className="text-slate-700 font-bold">
              Are you sure you want to remove <span className="font-black text-slate-900">{deleting.productName}</span> from <span className="font-black text-slate-900">{deleting.userName}</span>'s favorites?
            </p>
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 font-semibold">
              ⚠️ This action cannot be undone.
            </div>
          </div>

          <div className="flex gap-2.5 pt-2">
            <button
              onClick={() => setDeleting(null)}
              className="flex-1 py-2.5 border-2 border-slate-300 rounded-lg font-bold text-xs uppercase tracking-wider hover:bg-slate-100 cursor-pointer text-slate-700 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={submitting}
              className="flex-1 py-2.5 bg-rose-600 text-white rounded-lg font-bold text-xs uppercase tracking-wider hover:bg-rose-700 cursor-pointer transition shadow-sm disabled:opacity-50"
            >
              {submitting ? 'Removing...' : 'Remove'}
            </button>
          </div>
        </Modal>
      )}

    </div>
  );
};

export default FavoriteManagement;