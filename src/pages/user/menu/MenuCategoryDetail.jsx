// src/pages/menu/MenuCategoryDetail.jsx
import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useProducts } from '../../../hooks/useProducts';
import { useCategories } from '../../../hooks/useCategories';
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

const formatSlugAsTitle = (slug) =>
    slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

const MenuCategoryDetail = () => {
    const { slug } = useParams();
    const { t }    = useTranslation();

    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage]               = useState(1);
    const PER_PAGE = 15;

    // Send category_slug to backend for proper server-side filtering and pagination
    const { data, isLoading, error } = useProducts({
        page,
        per_page: PER_PAGE,
        search: searchQuery,
        category_slug: slug,
    });

    // Fetch category name separately to ensure accurate display, even without products
    const { data: categoriesData } = useCategories({ per_page: 100 });

    const products    = data?.data?.data ?? [];
    const totalPages  = data?.data?.last_page ?? 1;
    const totalItems  = data?.data?.total ?? products.length;

    const allCategories = categoriesData?.data?.data ?? [];
    const categoryInfo  = allCategories.find((c) => c.slug === slug);
    const categoryName  = categoryInfo?.name || formatSlugAsTitle(slug);

    // reset page when search change
    const handleSearch = (e) => {
        setSearchQuery(e.target.value);
        setPage(1);
    };

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
                            {totalItems} {totalItems === 1 ? 'dish' : 'dishes'}
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
                            onChange={handleSearch}
                            placeholder={t('menu.searchPlaceholder')}
                            className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 focus:border-[#2D4A22] outline-none text-xs rounded-sm shadow-sm transition-all focus:shadow-md"
                        />
                    </div>
                </div>

                {products.length > 0 ? (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {products.map(item => (
                            <div key={item.id} className="bg-white border border-gray-100 shadow-md hover:shadow-lg transition-all duration-300 flex flex-col h-full">
                                <div className="relative h-56 overflow-hidden bg-[#F9F9F9]">
                                    <img src={getImageUrl(item.image)} className="w-full h-full object-cover" alt={item.name} />
                                    <div className="absolute top-3 right-3 bg-white/95 px-3 py-1 text-[#2D4A22] font-black text-xs rounded-full shadow-sm">
                                        ${parseFloat(item.price).toFixed(2)}
                                    </div>
                                </div>
                                <div className="p-5 flex flex-col flex-1">
                                    <h3 className="text-sm font-bold text-[#2D4A22] uppercase line-clamp-1 mb-2">{item.name}</h3>
                                    <p className="text-xs text-gray-400 leading-relaxed mb-6 flex-1 line-clamp-2">
                                        {item.description || 'Authentic organic recipe.'}
                                    </p>
                                    <Link
                                        to={`/menu/product/${item.id}`}
                                        className="w-full bg-[#FAFAFA] border border-gray-200 text-[#2D4A22] py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#2D4A22] hover:text-white transition-all flex items-center justify-center gap-2"
                                    >
                                        <span>{t('menu.viewDetails')}</span>
                                        <FaChevronRight size={8} />
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>

                        {/* Pagination Buttons */}
                        {totalPages > 1 && (
                            <div className="flex justify-center gap-2 mt-12">
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                                    <button
                                        key={p}
                                        onClick={() => setPage(p)}
                                        className={`w-9 h-9 text-xs font-bold rounded-full border transition-all ${
                                            page === p
                                                ? 'bg-[#2D4A22] text-white border-[#2D4A22]'
                                                : 'bg-white text-gray-500 border-gray-200 hover:border-[#2D4A22] hover:text-[#2D4A22]'
                                        }`}
                                    >
                                        {p}
                                    </button>
                                ))}
                            </div>
                        )}
                    </>
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