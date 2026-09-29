import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useProducts } from '../../../hooks/useProducts';
import { useCategories } from '../../../hooks/useCategories';
import useFavorite from '../../../hooks/useFavorite';
import { FaHeart, FaRegHeart, FaShoppingCart, FaFilter, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { IoSearch } from 'react-icons/io5';
import Toast from '../../../components/common/Toast';
import { getImageUrl } from '../../../utils/imageUrl';
const PRICE_RANGES = [
  { id: 'all',    labelKey: 'menu.allPrices' },
  { id: 'low',    labelKey: 'menu.under'     },
  { id: 'medium', labelKey: 'menu.medium'    },
  { id: 'high',   labelKey: 'menu.over'      },
];

const ITEMS_PER_PAGE = 12;
const FETCH_ALL_PER_PAGE = 1000;

const AllMenu = () => {
  const { t }        = useTranslation();
  const navigate     = useNavigate();

  const [searchTerm,       setSearchTerm]       = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [priceRange,       setPriceRange]       = useState('all');
  const [sortBy,           setSortBy]           = useState('name');
  const [currentPage,      setCurrentPage]      = useState(1);
  const [showToast,        setShowToast]        = useState(false);
  const [toastMessage,     setToastMessage]     = useState('');

  const { favorites, isFavorite, toggleFavorite } = useFavorite();

  // Fetch ALL products at once
  const { data: productsData, isLoading: productsLoading, error: productsError } = useProducts({
    per_page: FETCH_ALL_PER_PAGE,
  });
  const allMenuItems = productsData?.data?.data || productsData?.data || [];

  // Fetch categories dynamically from API
  const { data: categoriesData, isLoading: categoriesLoading } = useCategories({ per_page: 100 });
  const categoriesFromAPI = categoriesData?.data?.data || categoriesData?.data || [];

  // Build category list
  const CATEGORIES = [
    { value: 'all', label: t('menu.allItems') },
    ...categoriesFromAPI.map(cat => ({
      value: cat.id,
      label: cat.name,
    })),
  ];

  // Reset to page 1 when filters change
  useEffect(() => { setCurrentPage(1); }, [searchTerm, selectedCategory, priceRange, sortBy]);

  // Filter
  const filteredItems = Array.isArray(allMenuItems)
    ? allMenuItems.filter(item => {
        const matchesSearch =
          item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.description?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesCategory =
          selectedCategory === 'all' ||
          item.category_id === selectedCategory ||
          item.category?.id === selectedCategory;

        const price = parseFloat(item.price || 0);
        const matchesPrice =
          priceRange === 'all'    ? true :
          priceRange === 'low'    ? price < 1.5 :
          priceRange === 'medium' ? price >= 1.5 && price <= 3.0 :
          priceRange === 'high'   ? price > 3.0 : true;

        return matchesSearch && matchesCategory && matchesPrice;
      })
    : [];

  // Sort
  const sortedItems = [...filteredItems].sort((a, b) => {
    if (sortBy === 'name')       return (a.name || '').localeCompare(b.name || '');
    if (sortBy === 'price-low')  return parseFloat(a.price || 0) - parseFloat(b.price || 0);
    if (sortBy === 'price-high') return parseFloat(b.price || 0) - parseFloat(a.price || 0);
    return 0;
  });

  // Pagination
  const totalPages   = Math.ceil(sortedItems.length / ITEMS_PER_PAGE);
  const currentItems = sortedItems.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleReset = () => {
    setSelectedCategory('all');
    setPriceRange('all');
    setSearchTerm('');
    setSortBy('name');
  };

  const handleToggleFavorite = (item) => {
    toggleFavorite(item, navigate);
  };

  // Add to Cart → localStorage
  const addToCart = (item) => {
   
    if (!sessionStorage.getItem('currentUser')) { navigate('/login'); return; }

    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const idx  = cart.findIndex(i => i.id === item.id);
    if (idx > -1) cart[idx].quantity += 1;
    else cart.push({ ...item, quantity: 1, type: 'product' });
    localStorage.setItem('cart', JSON.stringify(cart));

    setToastMessage(`${item.name} added to cart!`);
    setShowToast(true);
    window.dispatchEvent(new Event('cartUpdated'));
  };

  // Loading / Error
  if (productsLoading || categoriesLoading) return (
    <div className="text-center py-40 font-bold text-gray-400 animate-pulse">
      Loading menu...
    </div>
  );

  if (productsError) return (
    <div className="text-center py-40 font-bold text-red-500">
      Error loading menu: {productsError.message}
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 pt-28">

      {/* Page Title */}
      <div className="mb-10 border-l-4 border-[#2D4A22] pl-4">
        <h1 className="text-3xl font-bold text-[#2D4A22]">
          OUR <span className="text-[#F58220]">MENU</span>
        </h1>
        <p className="text-gray-500 text-sm font-medium">
          {t('menu.subtitle') || 'Fresh and Organic Products'}
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">

        {/* Sidebar */}
        <aside className="w-full lg:w-1/4">
          <div className="bg-white border border-gray-100 shadow-sm p-6 sticky top-28">

            {/* Header */}
            <div className="flex justify-between items-center mb-6 border-b pb-2">
              <h2 className="font-bold text-gray-800 flex items-center gap-2">
                <FaFilter className="text-[#F58220]" />
                {t('menu.filters')}
              </h2>
              <button
                onClick={handleReset}
                className="text-xs text-[#F58220] font-bold hover:underline uppercase"
              >
                {t('menu.reset')}
              </button>
            </div>

            {/* Category */}
            <div className="mb-8">
              <h3 className="font-bold text-xs mb-4 text-gray-400 uppercase tracking-widest">
                {t('menu.category')}
              </h3>
              <div className="space-y-1">
                {CATEGORIES.map(cat => (
                  <label
                    key={cat.value}
                    className={`flex items-center gap-3 p-3 cursor-pointer border transition-all
                      ${selectedCategory === cat.value
                        ? 'border-[#F58220] bg-[#FFF8F2]'
                        : 'border-transparent hover:bg-gray-50'
                      }`}
                  >
                    <input
                      type="radio"
                      name="category"
                      checked={selectedCategory === cat.value}
                      onChange={() => setSelectedCategory(cat.value)}
                      className="w-4 h-4 accent-[#F58220]"
                    />
                    <span className="text-sm font-bold text-gray-700">{cat.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div className="mb-8">
              <h3 className="font-bold text-xs mb-4 text-gray-400 uppercase tracking-widest">
                {t('menu.priceRange')}
              </h3>
              <div className="space-y-1">
                {PRICE_RANGES.map(range => (
                  <label
                    key={range.id}
                    className={`flex items-center gap-3 p-3 cursor-pointer border transition-all
                      ${priceRange === range.id
                        ? 'border-[#F58220] bg-[#FFF8F2]'
                        : 'border-transparent hover:bg-gray-50'
                      }`}
                  >
                    <input
                      type="radio"
                      name="priceRange"
                      checked={priceRange === range.id}
                      onChange={() => setPriceRange(range.id)}
                      className="w-4 h-4 accent-[#F58220]"
                    />
                    <span className="text-sm font-bold text-gray-700">{t(range.labelKey)}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Results count */}
            <div className="border-t pt-4">
              <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">
                {t('menu.showing')} {sortedItems.length} {t('menu.items')}
              </p>
            </div>

          </div>
        </aside>

        {/* Main Content */}
        <div className="w-full lg:w-3/4">

          {/* Search & Sort */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <IoSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder={t('menu.searchPlaceholder')}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 outline-none focus:border-[#2D4A22]"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className="px-4 py-3 border border-gray-200 outline-none font-bold text-sm text-[#2D4A22] bg-white cursor-pointer"
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
            >
              <option value="name">{t('menu.nameAZ')}</option>
              <option value="price-low">{t('menu.priceLowHigh')}</option>
              <option value="price-high">{t('menu.priceHighLow')}</option>
            </select>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {currentItems.length > 0 ? (
              currentItems.map(item => {
                const price = parseFloat(item.price || 0);
                const discount = parseFloat(item.discount_price || 0);
                const hasDiscount = discount > 0 && discount < price;
                const discountPercent = hasDiscount ? Math.round(((price - discount) / price) * 100) : 0;

                const fav = isFavorite(item.id);

                return (
                  <div key={item.id} className="group bg-white border border-gray-100 hover:border-[#2D4A22] transition-all duration-300 shadow-sm flex flex-col justify-between">
                    <div>
                      <div className="relative h-48 overflow-hidden bg-gray-50">
                        <Link to={`/menu/product/${item.id}`}>
                          <img
                            src={getImageUrl(item.image)}
                            alt={item.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            onError={e => { e.target.src = 'https://placehold.co/400x300?text=Khmer+Fresh'; }}
                          />
                        </Link>

                        <button
                          onClick={() => handleToggleFavorite(item)}
                          className="absolute top-3 right-3 w-9 h-9 bg-white border border-gray-100 flex items-center justify-center hover:bg-[#2D4A22] hover:text-white transition-colors shadow-sm"
                        >
                          {fav
                            ? <FaHeart className="text-red-500" />
                            : <FaRegHeart className="text-gray-400 group-hover:text-white" />
                          }
                        </button>

                        {/* Discount Badge */}
                        {hasDiscount && (
                          <span className="absolute top-3 left-3 bg-red-500 text-white text-[9px] font-black uppercase tracking-widest px-2 py-1">
                            -{discountPercent}%
                          </span>
                        )}
                      </div>

                      <div className="p-5">
                        {item.category?.name && (
                          <p className="text-[9px] font-black text-[#F58220] uppercase tracking-widest mb-1">{item.category.name}</p>
                        )}
                        <Link to={`/menu/product/${item.id}`}>
                          <h3 className="font-bold text-[#2D4A22] text-lg uppercase truncate">{item.name}</h3>
                        </Link>
                      </div>
                    </div>

                    <div className="p-5 pt-0">
                      <div className="flex items-center justify-between border-t border-gray-50 pt-4">
                        <div className="flex items-center gap-2">
                          <span className="text-xl font-black text-[#2D4A22] tracking-tighter">
                            ${(hasDiscount ? discount : price).toFixed(2)}
                          </span>
                          {hasDiscount && (
                            <span className="text-xs text-gray-400 line-through">${price.toFixed(2)}</span>
                          )}
                        </div>
                        <button
                          onClick={() => addToCart(item)}
                          className="bg-[#2D4A22] text-white px-5 py-2.5 text-xs font-bold flex items-center gap-2 hover:bg-[#F58220] transition-colors shadow-sm uppercase"
                        >
                          <FaShoppingCart /> {t('menu.add')}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-full text-center py-24 border border-dashed border-gray-200 bg-white">
                <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest">
                  {t('menu.noItems')}
                </h3>
                <p className="text-xs text-gray-400 mt-2">{t('menu.tryAdjusting')}</p>
                <button
                  onClick={handleReset}
                  className="mt-4 text-xs text-[#F58220] font-bold hover:underline uppercase tracking-widest"
                >
                  {t('menu.clearFilters')}
                </button>
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-12 flex justify-center items-center gap-1">
              <button
                disabled={currentPage === 1}
                onClick={() => { setCurrentPage(p => p - 1); window.scrollTo(0, 0); }}
                className="w-10 h-10 border border-gray-200 flex items-center justify-center hover:bg-gray-50 disabled:opacity-20 transition-all"
              >
                <FaChevronLeft size={12} />
              </button>
              <div className="flex items-center px-4">
                <span className="text-xs font-black text-gray-400 tracking-widest uppercase">
                  {t('menu.page')} {currentPage} {t('menu.of')} {totalPages}
                </span>
              </div>
              <button
                disabled={currentPage === totalPages}
                onClick={() => { setCurrentPage(p => p + 1); window.scrollTo(0, 0); }}
                className="w-10 h-10 bg-[#2D4A22] text-white flex items-center justify-center hover:bg-[#F58220] disabled:opacity-20 transition-all"
              >
                <FaChevronRight size={12} />
              </button>
            </div>
          )}

        </div>
      </div>

      {showToast && <Toast message={toastMessage} onClose={() => setShowToast(false)} />}
    </div>
  );
};

export default AllMenu;