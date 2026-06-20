import React from 'react';
import { useTranslation, Trans } from 'react-i18next';
import { FaClock, FaShieldAlt, FaLeaf, FaHeart, FaCommentAlt } from 'react-icons/fa';
import { MdDeliveryDining } from 'react-icons/md';
import { Link } from "react-router-dom";
const IconWrapDark = ({ icon }) => (
  <div
    className={`
      w-[50px] h-[50px] rounded-[14px] flex items-center justify-center text-xl flex-shrink-0
      border-[1.5px] border-gray-200 bg-white text-[#1a3a32]
      transition-all duration-300 group-hover:bg-[#1a3a32] group-hover:border-[#1a3a32]
      group-hover:text-[#c8f04a] group-hover:-rotate-6 group-hover:scale-105
    `}
  >
    {icon}
  </div>
);

const ArrowBtn = () => (
  <div className="absolute bottom-5 right-5 w-[30px] h-[30px] rounded-full bg-gray-100 flex items-center justify-center transition-all duration-300 group-hover:bg-[#e07020] group-hover:translate-x-1">
    <svg className="w-3 h-3 text-gray-400 group-hover:text-white transition-colors duration-300" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  </div>
);

const Features = () => {
  const { t } = useTranslation();

  return (
    <section className="w-full bg-white py-20 px-6 lg:px-14 font-sans">
      <div className="max-w-7xl mx-auto">

        {/* ─── Header ─── */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between mb-14 gap-8">
          <div>
            <div className="inline-flex items-center gap-2 text-[#e07020] text-[11px] font-bold tracking-[.25em] uppercase mb-4">
              <span className="w-7 h-[2px] bg-[#e07020] rounded" />
              {t('home.whyChooseUs')}
            </div>
            <h2 className="font-['Playfair_Display',serif] text-4xl lg:text-[40px] font-black text-[#278806] leading-[1] tracking-[-2px]">
            <Trans
              i18nKey="home.whatMakesUsSpecial"
              components={{ highlight: <span className="text-[#e07020]" /> }}
            />
          </h2>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-0 flex-shrink-0">
            {[
              { n: '200+', l: t('home.statDishes') || 'Dishes' },
              { n: '4.9★', l: t('home.statRating') || 'Rating' },
              { n: '12K+', l: t('home.statCustomers') || 'Customers' },
            ].map((s, i) => (
              <div key={i} className={`text-center px-6 ${i < 2 ? 'border-r border-gray-200' : ''}`}>
                <p className="font-['Playfair_Display',serif] text-2xl font-black text-[#3bb906]">{s.n}</p>
                <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mt-0.5">{s.l}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ─── Asymmetric Grid ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* MAIN BIG CARD */}
          <div className="group relative bg-[#1a3a32] rounded-[20px] p-9 flex flex-col justify-between min-h-[380px] lg:row-span-2 overflow-hidden cursor-pointer transition-transform duration-300 hover:-translate-y-1">
            <span className="absolute bottom-4 right-5 font-['Playfair_Display',serif] text-[100px] font-black leading-none text-white/[0.05] select-none">01</span>
            <div>
              <div className="w-16 h-16 rounded-[18px] bg-[#c8f04a]/15 flex items-center justify-center text-[#c8f04a] text-3xl mb-8 transition-all duration-300 group-hover:bg-[#c8f04a] group-hover:text-[#1a3a32] group-hover:-rotate-8 group-hover:scale-110">
                <FaLeaf />
              </div>
              <h3 className="text-[26px] font-extrabold text-white uppercase tracking-tight leading-tight mb-3">
                {t('home.freshIngredients')}
              </h3>
              <p className="text-white/50 text-sm leading-relaxed">
                {t('home.freshIngredientsDesc')}
              </p>
            </div>
            <div className="inline-flex items-center gap-1.5 mt-7 bg-[#c8f04a]/15 text-[#c8f04a] text-[11px] font-bold px-4 py-2 rounded-full tracking-wider transition-all duration-300 group-hover:bg-[#c8f04a] group-hover:text-[#1a3a32] w-fit">
              100% Organic
            </div>
          </div>

          {/* SMALL CARD — Fast Delivery */}
          <div className="group relative bg-[#f6f8f5] border-[1.5px] border-transparent rounded-[20px] p-8 cursor-pointer transition-all duration-300 hover:bg-white hover:border-[#d0e8c8] hover:-translate-y-1 overflow-hidden">
            <span className="absolute top-4 right-5 font-['Playfair_Display',serif] text-5xl font-black text-[#1a3a32]/[0.04] select-none">02</span>
            <IconWrapDark icon={<MdDeliveryDining />} />
            <h3 className="mt-4 text-[16px] font-extrabold text-[#1a3a32] uppercase tracking-wide mb-2 transition-colors duration-300 group-hover:text-[#e07020]">
              {t('home.fastDelivery')}
            </h3>
            <p className="text-[12.5px] text-gray-400 leading-relaxed">{t('home.fastDeliveryDesc')}</p>
            <ArrowBtn />
          </div>

          {/* SMALL CARD — Quality */}
          <div className="group relative bg-[#f6f8f5] border-[1.5px] border-transparent rounded-[20px] p-8 cursor-pointer transition-all duration-300 hover:bg-white hover:border-[#d0e8c8] hover:-translate-y-1 overflow-hidden">
            <span className="absolute top-4 right-5 font-['Playfair_Display',serif] text-5xl font-black text-[#1a3a32]/[0.04] select-none">03</span>
            <IconWrapDark icon={<FaShieldAlt />} />
            <h3 className="mt-4 text-[16px] font-extrabold text-[#1a3a32] uppercase tracking-wide mb-2 transition-colors duration-300 group-hover:text-[#e07020]">
              {t('home.qualityGuaranteed')}
            </h3>
            <p className="text-[12.5px] text-gray-400 leading-relaxed">{t('home.qualityGuaranteedDesc')}</p>
            <ArrowBtn />
          </div>

          {/* WIDE CARD — Made with Love */}
          <div className="group lg:col-span-2 bg-[#fff9f5] border-[1.5px] border-[#fde8d8] rounded-[20px] p-8 cursor-pointer transition-all duration-300 hover:bg-white hover:border-[#f4c4a0] hover:-translate-y-1">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 rounded-[18px] bg-white border-2 border-[#fde8d8] flex items-center justify-center text-[#e07020] text-2xl flex-shrink-0 transition-all duration-300 group-hover:bg-[#e07020] group-hover:border-[#e07020] group-hover:text-white group-hover:scale-110">
                <FaHeart />
              </div>
              <div>
                <h3 className="text-[18px] font-extrabold text-[#1a3a32] uppercase tracking-wide mb-2 transition-colors duration-300 group-hover:text-[#e07020]">
                  {t('home.madeWithLove')}
                </h3>
                <p className="text-[13px] text-[#bba898] leading-relaxed">{t('home.madeWithLoveDesc')}</p>
                <span className="mt-3 inline-flex items-center gap-1.5 bg-[#fde8d8] text-[#c05010] text-[11px] font-bold px-3 py-1.5 rounded-full">
                  Family Recipes Since 1985
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ─── Bottom Row ─── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div className="group flex items-center gap-5 bg-[#f6f8f5] border-[1.5px] border-transparent rounded-[20px] p-7 cursor-pointer transition-all duration-300 hover:bg-white hover:border-[#d0e8c8] hover:-translate-y-1">
            <IconWrapDark icon={<FaClock />} />
            <div>
              <h3 className="text-[15px] font-extrabold text-[#1a3a32] uppercase tracking-wide mb-1 transition-colors duration-300 group-hover:text-[#e07020]">
                {t('home.open247')}
              </h3>
              <p className="text-[12.5px] text-gray-400 leading-relaxed">{t('home.open247Desc')}</p>
            </div>
          </div>
          <div className="group flex items-center gap-5 bg-[#f6f8f5] border-[1.5px] border-transparent rounded-[20px] p-7 cursor-pointer transition-all duration-300 hover:bg-white hover:border-[#d0e8c8] hover:-translate-y-1">
            <IconWrapDark icon={<FaCommentAlt />} />
            <div>
              <h3 className="text-[15px] font-extrabold text-[#1a3a32] uppercase tracking-wide mb-1 transition-colors duration-300 group-hover:text-[#e07020]">
                {t('home.authenticRecipes')}
              </h3>
              <p className="text-[12.5px] text-gray-400 leading-relaxed">{t('home.authenticRecipesDesc')}</p>
            </div>
          </div>
        </div>

        {/* ─── CTA ─── */}
        <div className="mt-4 bg-[#1a3a32] rounded-[20px] px-10 py-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h4 className="font-['Playfair_Display',serif] text-[22px] font-black text-white mb-1">
              {t('home.readyToExperience')}
            </h4>
            <p className="text-white/40 text-sm">
              {t('home.joinCustomers')}
            </p>
          </div>
          <Link to='/menu'>
            <button className="flex-shrink-0 flex items-center gap-2 bg-[#c8f04a] text-[#1a3a32] font-extrabold text-[12px] uppercase tracking-widest px-7 py-4 rounded-xl transition-all duration-300 hover:bg-[#b8e030] hover:scale-105 active:scale-100">
              {t('home.readyToOrder')}
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Features;