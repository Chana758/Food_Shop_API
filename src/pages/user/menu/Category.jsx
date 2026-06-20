import React, { useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useCategories } from '../../../hooks/useCategories';

const Category = () => {
    const { t } = useTranslation();

    useEffect(() => {
        AOS.init({ duration: 800, once: true });
    }, []);

    const { data: categoriesData, isLoading, error } = useCategories();

    if (isLoading) return (
        <div className="text-center py-24 font-bold text-gray-400">
            {t('common.loading')}
        </div>
    );

    if (error) return (
        <div className="text-center py-24 font-black text-gray-500">
            {t('common.error')}: {error.message}
        </div>
    );

    const categories = categoriesData?.data?.data
        ? categoriesData.data.data
        : (Array.isArray(categoriesData?.data) ? categoriesData.data
        : (Array.isArray(categoriesData) ? categoriesData : []));

    if (categories.length === 0) return (
        <div className="text-center py-24 text-gray-400">
            {t('menu.noItems')}
        </div>
    );

    return (
        <div className="bg-white py-24">
            <div className="container mx-auto px-6">

                {/* Section Header */}
                <div className="mb-16 text-center" data-aos="fade-up">
                    <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-orange-500/90 block mb-2">
                        {t('category.subtitle')}
                    </span>
                    <h2 className="text-2xl md:text-3xl font-extrabold text-[#1a3a32] tracking-tight">
                        {t('category.browseBy')}{' '}
                        <span className="font-light text-gray-400">{t('menu.category')}</span>
                    </h2>
                    <div className="w-10 h-[2px] bg-orange-500 mx-auto mt-3 rounded-full" />
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
                            {/* Card Image */}
                            <div className="overflow-hidden w-full aspect-[4/3] mb-6 relative bg-gray-100">
                                <img
                                    src={
                                        category.image
                                            ? `http://127.0.0.1:8000/storage/${category.image}`
                                            : 'https://placehold.co/400x300?text=Food'
                                    }
                                    alt={category.name}
                                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                                    onError={(e) => { e.target.src = 'https://placehold.co/400x300?text=Food'; }}
                                />
                                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-[#148a2c] text-[10px] font-bold px-2 py-1 rounded shadow-sm tracking-wider uppercase">
                                    {t('category.active')}
                                </div>
                            </div>

                            {/* Card Info */}
                            <div className="flex flex-col items-center px-2 w-full">
                                <p className="text-gray-400 text-[10px] font-medium tracking-widest mb-2 uppercase">
                                    {category.created_at
                                        ? new Date(category.created_at).toLocaleDateString()
                                        : t('category.recent')}
                                </p>

                                <h3 className="text-[15px] font-bold text-gray-800 leading-snug mb-1 transition-colors duration-300 group-hover:text-[#8bc34a]">
                                    {category.name}
                                </h3>

                                <span className="text-orange-500 text-[10px] font-medium tracking-wide mb-3 block">
                                    ({category.slug})
                                </span>

                                <p className="text-gray-400 text-[11px] leading-relaxed line-clamp-2 max-w-[200px]">
                                    {category.description || t('category.noDescription')}
                                </p>
                            </div>
                        </Link>
                    ))}
                </div>

            </div>
        </div>
    );
};

export default Category;
