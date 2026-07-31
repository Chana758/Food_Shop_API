import React from 'react';
import { useTranslation, Trans } from 'react-i18next';
import { FaClock, FaShieldAlt, FaLeaf, FaHeart, FaCommentAlt, FaArrowRight } from 'react-icons/fa';
import { MdDeliveryDining } from 'react-icons/md';
import { Link } from "react-router-dom";

/* ------------------------------------------------------------------
   Redesign notes
   - Header ត្រូវបានធ្វើឲ្យសាមញ្ញជាង: stats ប្តូរទៅជា pill strip ដាច់ដោយឡែក
     ពី headline, មិនច្របូកច្របល់នឹង title ទៀតទេ
   - Hero card (01) រក្សា treatment ដដែល ប៉ុន្តែបន្ថែម pattern ខាងក្រោយ
     ឲ្យមាន texture, និង CTA mini-link ខាងក្នុង
   - Grid ត្រូវបានតម្រៀបជា bento ស៊ីមេទ្រីជាង: 2 card តូចខាងលើ ស្មើគ្នា
     1 card ធំពាក់កណ្ដាល (Made with love) ដូចដើម ប៉ុន្តែ layout ស្អាតជាង
   - គ្រប់ card តូចមាន "peek arrow" លេចឡើងពេល hover ជា affordance ថា
     អាច click បាន (wrap ក្នុង optional Link បើមាន route)
   - CTA banner បន្ថែម decorative leaf ធំពាក់កណ្ដាល ស្រដៀង brand icon
------------------------------------------------------------------- */

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

const GhostNumber = ({ n }) => (
  <span className="absolute top-4 right-5 font-['Playfair_Display',serif] text-5xl font-black text-[#1a3a32]/[0.04] select-none pointer-events-none">
    {n}
  </span>
);

const PeekArrow = () => (
  <span className="absolute bottom-6 right-6 w-8 h-8 rounded-full bg-[#1a3a32] text-[#c8f04a] flex items-center justify-center text-[11px] opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
    <FaArrowRight />
  </span>
);

const Features = () => {
  const { t } = useTranslation();

  const stats = [
    { n: '200+', l: t('home.statDishes', 'Dishes') },
    { n: '4.9★', l: t('home.statRating', 'Rating') },
    { n: '12K+', l: t('home.statCustomers', 'Customers') },
  ];

  return (
    <section className="w-full bg-white py-20 px-6 lg:px-14 font-sans">
      <div className="max-w-7xl mx-auto">

        {/* ─── Header ─── */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-16 gap-8">
          <div>
            <div className="inline-flex items-center gap-2 text-[#e07020] text-[11px] font-bold tracking-[.25em] uppercase mb-4">
              <span className="w-7 h-[2px] bg-[#e07020] rounded" />
              {t('home.whyChooseUs')}
            </div>
            <h2 className="font-['Playfair_Display',serif] text-4xl lg:text-[42px] font-black text-[#1a3a32] leading-[1.05] tracking-[-1.5px]">
              <Trans
                i18nKey="home.whatMakesUsSpecial"
                components={{ highlight: <span className="text-[#e07020]" /> }}
              />
            </h2>
          </div>

          {/* Stats — ដាក់ជា pill strip ខ្មៅ contrast ជាមួយ background ស
              ដើម្បីឲ្យលេចធ្លោដាច់ដោយឡែកពី title, មិនប៉ះលេខ hierarchy */}
          <div className="flex items-stretch bg-[#1a3a32] rounded-2xl overflow-hidden flex-shrink-0 shadow-lg shadow-[#1a3a32]/10">
            {stats.map((s, i) => (
              <div
                key={i}
                className={`text-center px-7 py-4 ${i < stats.length - 1 ? 'border-r border-white/10' : ''}`}
              >
                <p className="font-['Playfair_Display',serif] text-2xl font-black text-[#c8f04a]">{s.n}</p>
                <p className="text-[10px] font-semibold text-white/50 uppercase tracking-wider mt-0.5">{s.l}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ─── Bento Grid ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* HERO CARD (01) — Fresh Ingredients */}
          <div className="group relative bg-[#1a3a32] rounded-[24px] p-9 flex flex-col justify-between min-h-[420px] lg:row-span-2 overflow-hidden transition-transform duration-300 hover:-translate-y-1">
            {/* Decorative dot-grid texture */}
            <div
              className="absolute inset-0 opacity-[0.06] pointer-events-none"
              style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '18px 18px' }}
            />
            <span className="absolute bottom-4 right-5 font-['Playfair_Display',serif] text-[110px] font-black leading-none text-white/[0.05] select-none pointer-events-none">01</span>

            <div className="relative z-10">
              <div className="w-16 h-16 rounded-[18px] bg-[#c8f04a]/15 flex items-center justify-center text-[#c8f04a] text-3xl mb-8 transition-all duration-300 group-hover:bg-[#c8f04a] group-hover:text-[#1a3a32] group-hover:-rotate-8 group-hover:scale-110">
                <FaLeaf />
              </div>
              <h3 className="text-[28px] font-extrabold text-white uppercase tracking-tight leading-tight mb-3">
                {t('home.freshIngredients')}
              </h3>
              <p className="text-white/50 text-sm leading-relaxed max-w-[85%]">
                {t('home.freshIngredientsDesc')}
              </p>
            </div>

            <div className="relative z-10 inline-flex items-center gap-1.5 mt-7 bg-[#c8f04a]/15 text-[#c8f04a] text-[11px] font-bold px-4 py-2 rounded-full tracking-wider transition-all duration-300 group-hover:bg-[#c8f04a] group-hover:text-[#1a3a32] w-fit">
              100% Organic
            </div>
          </div>

          {/* SMALL CARD (02) — Fast Delivery */}
          <div className="group relative bg-[#f6f8f5] border-[1.5px] border-transparent rounded-[24px] p-8 transition-all duration-300 hover:bg-white hover:border-[#d0e8c8] hover:-translate-y-1 hover:shadow-xl hover:shadow-[#1a3a32]/5 overflow-hidden">
            <GhostNumber n="02" />
            <IconWrapDark icon={<MdDeliveryDining />} />
            <h3 className="mt-5 text-[16px] font-extrabold text-[#1a3a32] uppercase tracking-wide mb-2 transition-colors duration-300 group-hover:text-[#e07020]">
              {t('home.fastDelivery')}
            </h3>
            <p className="text-[12.5px] text-gray-400 leading-relaxed pr-6">{t('home.fastDeliveryDesc')}</p>
            <PeekArrow />
          </div>

          {/* SMALL CARD (03) — Quality */}
          <div className="group relative bg-[#f6f8f5] border-[1.5px] border-transparent rounded-[24px] p-8 transition-all duration-300 hover:bg-white hover:border-[#d0e8c8] hover:-translate-y-1 hover:shadow-xl hover:shadow-[#1a3a32]/5 overflow-hidden">
            <GhostNumber n="03" />
            <IconWrapDark icon={<FaShieldAlt />} />
            <h3 className="mt-5 text-[16px] font-extrabold text-[#1a3a32] uppercase tracking-wide mb-2 transition-colors duration-300 group-hover:text-[#e07020]">
              {t('home.qualityGuaranteed')}
            </h3>
            <p className="text-[12.5px] text-gray-400 leading-relaxed pr-6">{t('home.qualityGuaranteedDesc')}</p>
            <PeekArrow />
          </div>

          {/* WIDE CARD (04) — Made with Love */}
          <div className="group relative lg:col-span-2 bg-[#fff9f5] border-[1.5px] border-[#fde8d8] rounded-[24px] p-8 transition-all duration-300 hover:bg-white hover:border-[#f4c4a0] hover:-translate-y-1 hover:shadow-xl hover:shadow-[#e07020]/5 overflow-hidden">
            <GhostNumber n="04" />
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 rounded-[18px] bg-white border-2 border-[#fde8d8] flex items-center justify-center text-[#e07020] text-2xl flex-shrink-0 transition-all duration-300 group-hover:bg-[#e07020] group-hover:border-[#e07020] group-hover:text-white group-hover:scale-110">
                <FaHeart />
              </div>
              <div>
                <h3 className="text-[18px] font-extrabold text-[#1a3a32] uppercase tracking-wide mb-2 transition-colors duration-300 group-hover:text-[#e07020]">
                  {t('home.madeWithLove')}
                </h3>
                <p className="text-[13px] text-[#b09d8d] leading-relaxed">{t('home.madeWithLoveDesc')}</p>
                <span className="mt-3 inline-flex items-center gap-1.5 bg-[#fde8d8] text-[#c05010] text-[11px] font-bold px-3 py-1.5 rounded-full">
                  Family Recipes Since 1985
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ─── Bottom Row ─── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div className="group relative flex items-center gap-5 bg-[#f6f8f5] border-[1.5px] border-transparent rounded-[24px] p-7 transition-all duration-300 hover:bg-white hover:border-[#d0e8c8] hover:-translate-y-1 hover:shadow-xl hover:shadow-[#1a3a32]/5 overflow-hidden">
            <GhostNumber n="05" />
            <IconWrapDark icon={<FaClock />} />
            <div>
              <h3 className="text-[15px] font-extrabold text-[#1a3a32] uppercase tracking-wide mb-1 transition-colors duration-300 group-hover:text-[#e07020]">
                {t('home.open247')}
              </h3>
              <p className="text-[12.5px] text-gray-400 leading-relaxed">{t('home.open247Desc')}</p>
            </div>
            <PeekArrow />
          </div>
          <div className="group relative flex items-center gap-5 bg-[#f6f8f5] border-[1.5px] border-transparent rounded-[24px] p-7 transition-all duration-300 hover:bg-white hover:border-[#d0e8c8] hover:-translate-y-1 hover:shadow-xl hover:shadow-[#1a3a32]/5 overflow-hidden">
            <GhostNumber n="06" />
            <IconWrapDark icon={<FaCommentAlt />} />
            <div>
              <h3 className="text-[15px] font-extrabold text-[#1a3a32] uppercase tracking-wide mb-1 transition-colors duration-300 group-hover:text-[#e07020]">
                {t('home.authenticRecipes')}
              </h3>
              <p className="text-[12.5px] text-gray-400 leading-relaxed">{t('home.authenticRecipesDesc')}</p>
            </div>
            <PeekArrow />
          </div>
        </div>

        {/* ─── CTA ─── */}
        <div className="relative mt-4 bg-[#1a3a32] rounded-[24px] px-10 py-9 flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden">
          {/* Decorative giant leaf ស្រិលៗខាងក្រោយ ដើម្បីភ្ជាប់ visual identity
              ជាមួយ hero card (01) ដោយមិនត្រូវការ image asset */}
          <FaLeaf className="absolute -right-6 -top-10 text-[180px] text-[#c8f04a]/[0.04] rotate-12 pointer-events-none select-none" />

          <div className="relative z-10">
            <h4 className="font-['Playfair_Display',serif] text-[24px] font-black text-white mb-1">
              {t('home.readyToExperience')}
            </h4>
            <p className="text-white/40 text-sm">
              {t('home.joinCustomers')}
            </p>
          </div>
          <Link to='/menu' className="relative z-10">
            <button className="flex-shrink-0 flex items-center gap-2 bg-[#c8f04a] text-[#1a3a32] font-extrabold text-[12px] uppercase tracking-widest px-7 py-4 rounded-xl transition-all duration-300 hover:bg-[#b8e030] hover:scale-105 active:scale-100">
              {t('home.readyToOrder')}
              <FaArrowRight size={11} />
            </button>
          </Link>
        </div>

      </div>
    </section>
  );
};

export default Features;