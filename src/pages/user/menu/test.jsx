import React, { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useProducts } from '../../../hooks/useProducts';
import { IoSearch } from 'react-icons/io5';
import { FaChevronRight, FaArrowLeft } from 'react-icons/fa';
import { BiLeaf } from 'react-icons/bi';

const getImageUrl = (image) => {
  if (!image) return 'https://placehold.co/400x300?text=Khmer+Fresh';
  if (image.startsWith('http')) return image;
  const cleanPath = image.replace('public/', '');
  return cleanPath.startsWith('storage/')
    ? `http://127.0.0.1:8000/${cleanPath}`
    : `http://127.0.0.1:8000/storage/${cleanPath}`;
};

const MenuCategoryDetail = () => {
  const { slug } = useParams();
  const { t }    = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');

  const { data: productsData, isLoading, error } = useProducts();

  const allProducts = useMemo(() =>
    productsData?.data?.data || productsData?.data || (Array.isArray(productsData) ? productsData : []),
  [productsData]);

  const categoryProducts = useMemo(() =>
    allProducts.filter(item => item.category?.slug === slug),
  [allProducts, slug]);

  // FIX: guard against missing item.name, and normalize Unicode so Khmer
  // text typed via different IME compositions (NFD vs NFC) still matches
  // what's stored in the database.
  const filteredItems = useMemo(() =>
    categoryProducts.filter(item => {
      const name = (item.name || '').normalize('NFC').toLowerCase();
      const query = searchQuery.normalize('NFC').toLowerCase();
      return name.includes(query);
    }),
  [categoryProducts, searchQuery]);

  const categoryName = categoryProducts[0]?.category?.name || slug.replace(/-/g, ' ');

  if (isLoading) return (
    <div className="w-full min-h-screen bg-[#FAFAFA] pt-32 flex flex-col items-center justify-center">
      <div className="w-10 h-10 border-4 border-gray-200 border-t-[#2D4A22] rounded-full animate-spin" />
      <p className="text-[11px] font-black uppercase tracking-widest text-gray-400 mt-4 animate-pulse">
        Loading Delicious Dishes...
      </p>
    </div>
  );

  if (error) return (
    <div className="w-full min-h-screen bg-[#FAFAFA] pt-32 flex flex-col items-center justify-center font-bold text-red-500">
      <p>Error: {error.message}</p>
      <button
        onClick={() => window.location.reload()}
        className="mt-4 px-4 py-2 bg-[#2D4A22] text-white text-xs rounded uppercase hover:bg-black transition-colors"
      >
        Retry Loading
      </button>
    </div>
  );

  return (
    <div className="w-full min-h-screen bg-[#FAFAFA] pt-32 pb-20 animate-fadeIn">
      <div className="max-w-7xl mx-auto px-6 md:px-14">

        <Link
          to="/"
          className="inline-flex items-center gap-2 text-[#2D4A22] font-black text-[9px] uppercase tracking-[0.2em] hover:text-[#F58220] transition-colors mb-6"
        >
          <FaArrowLeft size={9} /> {t('menu.backToCategories') || 'All categories'}
        </Link>

        <div className="mb-14 border-b border-gray-200/60 pb-8 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-[#F58220] text-[10px] font-black uppercase tracking-[0.2em] mb-2">
              <BiLeaf size={14} />
              <span>Khmer Fresh Organic Selection</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-[#2D4A22] uppercase tracking-tight">
              {t('menu.category')} <span className="text-[#F58220] font-light">/ {categoryName}</span>
            </h1>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-2">
              {filteredItems.length} {filteredItems.length === 1 ? 'dish' : 'dishes'}
            </p>
          </div>

          <div className="relative w-full md:w-80 group">
            <IoSearch
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#2D4A22] transition-colors"
              size={16}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('menu.searchPlaceholder')}
              className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 focus:border-[#2D4A22] outline-none text-xs rounded-sm shadow-sm transition-all focus:shadow-md"
            />
          </div>
        </div>

        {filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {filteredItems.map(item => (
              <div
                key={item.id}
                className="bg-white border border-gray-100 overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-[0_10px_30px_rgba(0,0,0,0.08)] transition-all duration-300 group flex flex-col justify-between h-[430px]"
              >
                <div>
                  <div className="relative h-56 overflow-hidden bg-[#F9F9F9] border-b border-gray-50">
                    <img
                      src={getImageUrl(item.image)}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      alt={item.name}
                    />
                    <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm px-3.5 py-1 text-[#2D4A22] font-black text-sm rounded-full shadow-sm border border-gray-100">
                      ${parseFloat(item.price).toFixed(2)}
                    </div>
                  </div>

                  <div className="p-5 space-y-2">
                    <h3 className="text-md font-bold text-[#2D4A22] uppercase group-hover:text-[#F58220] transition-colors line-clamp-1 tracking-tight">
                      {item.name}
                    </h3>
                    <p className="text-xs text-gray-400 line-clamp-3 leading-relaxed font-normal h-[54px]">
                      {item.description || 'Authentic organic recipe meticulously crafted by Khmer-Fresh.'}
                    </p>
                  </div>
                </div>

                <div className="p-5 pt-0">
                  <Link
                    to={`/menu/product/${item.id}`}
                    className="w-full bg-[#FAFAFA] border border-gray-200/60 text-[#2D4A22] py-3 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#2D4A22] hover:text-white transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    <span>{t('menu.viewDetails')}</span>
                    <FaChevronRight size={10} className="group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-28 border border-dashed border-gray-200 bg-white rounded-2xl shadow-sm max-w-xl mx-auto p-8">
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">
              {t('menu.noItems')}
            </p>
            <p className="text-xs text-gray-400 font-light">{t('menu.tryAdjusting')}</p>
          </div>
        )}

      </div>
    </div>
  );
};

export default MenuCategoryDetail;