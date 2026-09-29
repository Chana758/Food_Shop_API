import React, { useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FaChevronRight } from 'react-icons/fa';
import { useCategories } from '../../../hooks/useCategories';
import { getImageUrl } from '../../../utils/imageUrl'; 

const FALLBACK_IMG = 'https://placehold.co/400x300?text=Khmer+Fresh';

const Category = () => {
  const { t } = useTranslation();

  useEffect(() => {
    AOS.init({ duration: 800, once: true });
  }, []);

  // ── Fetch all categories from API 
  const { data: categoriesData, isLoading, error } = useCategories({ per_page: 100 });

  // ── Parse response 
  // Laravel may return: { data: { data: [...] } } (paginated) or { data: [...] }
  const categories =
    categoriesData?.data?.data ||
    categoriesData?.data       ||
    [];

  // ── Loading
  if (isLoading) return (
    <div className="text-center py-24 font-bold text-gray-400 animate-pulse">
      {t('common.loading', 'Loading...')}
    </div>
  );

  // ── Error 
  if (error) return (
    <div className="text-center py-24 font-black text-gray-500">
      {t('common.error', 'Error')}: {error.message}
    </div>
  );

  // ── Empty 
  if (categories.length === 0) return (
    <div className="text-center py-24 text-gray-400">
      {t('category.empty', 'No categories found.')}
    </div>
  );

  // ── Render 
  return (
    <div className="bg-white py-24">
      <div className="container mx-auto px-6">

        {/* Header */}
        <div className="mb-16 text-center" data-aos="fade-up">
          <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#F58220]/90 block mb-2">
            {t('category.subtitle', 'Our Culinary Offerings')}
          </span>
          <h2 className="text-2xl md:text-3xl font-extrabold text-[#2D4A22] tracking-tight">
            {t('category.browseBy', 'Browse by')}{' '}
            <span className="font-light text-gray-400">{t('menu.category', 'Category')}</span>
          </h2>
          <div className="w-10 h-[2px] bg-[#F58220] mx-auto mt-3 rounded-full" />
        </div>

        {/* Category Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-[1400px] mx-auto">
          {categories.map((category, index) => (
            <Link
              key={category.id}
              to={`/menu/${category.slug}`}
              data-aos="fade-up"
              data-aos-delay={index * 100}
              className="group flex flex-col items-center text-center bg-white"
            >
              {/* Category Image */}
              <div className="overflow-hidden w-full aspect-[4/3] mb-6 relative bg-gray-100">
                <img
                  src={getImageUrl(category.image_url || category.image, FALLBACK_IMG)}
                  alt={category.name}
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  onError={e => {
                    // prevent infinite loop if the fallback itself fails
                    e.target.onerror = null;
                    e.target.src = FALLBACK_IMG;
                  }}
                />

                {/* Product count badge */}
                {category.products_count > 0 && (
                  <span className="absolute bottom-3 right-3 bg-[#2D4A22] text-white text-[9px] font-black uppercase tracking-widest px-2 py-1">
                    {category.products_count} {t('menu.items', 'items')}
                  </span>
                )}
              </div>

              {/* Category Info */}
              <div className="flex flex-col items-center px-2 w-full">
                <h3 className="text-[15px] font-bold text-gray-800 leading-snug mb-2 transition-colors duration-300 group-hover:text-[#F58220]">
                  {category.name}
                </h3>
                <p className="text-gray-400 text-[11px] leading-relaxed line-clamp-2 max-w-[200px] mb-3">
                  {category.description || t('category.noDescription', 'Explore our selection')}
                </p>
                <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-[#F58220] opacity-0 -translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                  {t('category.viewMenu', 'View menu')}
                  <FaChevronRight size={8} className="group-hover:translate-x-0.5 transition-transform" />
                </span>
              </div>
            </Link>
          ))}
        </div>

      </div>
    </div>
  );
};

export default Category;