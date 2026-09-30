import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaHeart, FaShoppingCart, FaTrash, FaArrowLeft } from 'react-icons/fa';
import useFavorite from '../../hooks/useFavorite';
import Toast from '../../components/common/Toast';
import { getImageUrl } from '../../utils/imageUrl';
import { getFinalPrice, hasDiscount } from '../../utils/priceUtils';

// Adapters: your helpers take (price, discount_price, discount_expires_at)
const finalPrice = (p) => getFinalPrice(p?.price, p?.discount_price, p?.discount_expires_at);
const onDiscount = (p) => hasDiscount(p?.price, p?.discount_price, p?.discount_expires_at);

const FALLBACK_IMG = 'https://placehold.co/400x300?text=Khmer+Fresh';

const isLoggedIn = () =>
  !!(localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser'));

const Favorites = () => {
  const navigate = useNavigate();
  const { favorites, loading, error, toggleFavorite } = useFavorite();
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  const addToCart = (item) => {
    if (!isLoggedIn()) { navigate('/login'); return; }

    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const idx = cart.findIndex(i => i.id === item.id && i.type === 'product');

    if (idx > -1) {
      cart[idx].quantity += 1;
    } else {
      cart.push({
        ...item,
        price: finalPrice(item),        // effective price (discount applied)
        originalPrice: Number(item.price), // keep the original for reference
        quantity: 1,
        type: 'product',
      });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    setToastMsg(`${item.name} added to cart!`);
    setShowToast(true);
    window.dispatchEvent(new Event('cartUpdated'));
  };

  if (loading) return (
    <div className="min-h-screen pt-32 flex items-center justify-center text-gray-400 font-bold animate-pulse">
      Loading favorites...
    </div>
  );

  if (error) return (
    <div className="min-h-screen pt-32 flex items-center justify-center text-red-400 font-bold">
      {error}
    </div>
  );

  return (
    <div className="w-full min-h-screen bg-[#FDFDFD] pt-28 pb-20 px-6 md:px-14">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="mb-12 border-b border-gray-100 pb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-[#2D4A22] font-black text-[10px] uppercase tracking-[0.3em] hover:text-[#F58220] transition-colors mb-6 group"
          >
            <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" /> Back
          </button>
          <div className="flex items-center gap-3">
            <FaHeart className="text-red-500" size={24} />
            <h1 className="text-3xl font-black text-[#2D4A22] uppercase tracking-tighter">
              My <span className="text-[#F58220]">Favorites</span>
            </h1>
          </div>
          <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-2">
            {favorites.length} {favorites.length === 1 ? 'item' : 'items'} saved
          </p>
        </div>

        {/* Empty State */}
        {favorites.length === 0 ? (
          <div className="text-center py-24 border border-dashed border-gray-200">
            <FaHeart className="text-gray-200 mx-auto mb-6" size={48} />
            <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4">
              No favorites yet
            </h2>
            <p className="text-xs text-gray-400 mb-8">
              Browse our menu and add items you love
            </p>
            <Link
              to="/menu"
              className="px-8 py-3 bg-[#2D4A22] text-white font-black text-[10px] uppercase tracking-[0.3em] hover:bg-[#F58220] transition-colors"
            >
              Browse Menu
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {favorites.map(item => (
              <div
                key={item.id}
                className="group bg-white border border-gray-100 hover:border-[#2D4A22] transition-all shadow-sm flex flex-col"
              >
                {/* Image */}
                <div className="relative h-48 overflow-hidden bg-gray-50">
                  <Link to={`/menu/product/${item.id}`}>
                    <img
                      src={getImageUrl(item.image, FALLBACK_IMG)}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={e => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = FALLBACK_IMG;
                      }}
                    />
                  </Link>

                  {/* Remove from favorites */}
                  <button
                    onClick={() => toggleFavorite(item, navigate)}
                    className="absolute top-3 right-3 w-8 h-8 bg-white border border-gray-100 flex items-center justify-center hover:bg-red-50 transition-colors shadow-sm"
                    title="Remove from favorites"
                  >
                    <FaTrash className="text-red-400" size={11} />
                  </button>
                </div>

                {/* Info */}
                <div className="p-5 flex flex-col flex-1">
                  {item.category?.name && (
                    <p className="text-[9px] font-black text-[#F58220] uppercase tracking-widest mb-1">
                      {item.category.name}
                    </p>
                  )}
                  <Link to={`/menu/product/${item.id}`}>
                    <h3 className="font-bold text-[#2D4A22] uppercase truncate mb-1">
                      {item.name}
                    </h3>
                  </Link>
                  <p className="text-xs text-gray-400 line-clamp-2 mb-4 flex-1">
                    {item.description || 'Authentic Khmer taste'}
                  </p>

                  {/* Price + Cart */}
                  <div className="flex items-center justify-between border-t border-gray-50 pt-4">
                    <div className="flex items-baseline gap-2">
                      <span className="text-lg font-black text-[#2D4A22]">
                        ${finalPrice(item).toFixed(2)}
                      </span>
                      {onDiscount(item) && (
                        <span className="text-[11px] text-gray-400 line-through">
                          ${Number(item.price).toFixed(2)}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => addToCart(item)}
                      className="flex items-center gap-2 bg-[#2D4A22] text-white px-4 py-2 text-[10px] font-black uppercase hover:bg-[#F58220] transition-colors"
                    >
                      <FaShoppingCart size={10} /> Add
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {showToast && <Toast message={toastMsg} onClose={() => setShowToast(false)} />}
    </div>
  );
};

export default Favorites;