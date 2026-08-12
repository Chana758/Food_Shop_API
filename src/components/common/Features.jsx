import React from 'react';
import { useTranslation, Trans } from 'react-i18next';
import { FaClock, FaShieldAlt, FaLeaf, FaHeart, FaCommentAlt, FaArrowRight } from 'react-icons/fa';
import { MdDeliveryDining } from 'react-icons/md';
import { Link } from "react-router-dom";

/* ------------------------------------------------------------------
   Redesign notes (v3) — signature: the "swing tag"
   Khmer-Fresh sells itself on being an organic market, so the cards
   are shaped like the swing tags tied to real produce/coffee bags:
   a punched grommet + thread in the corner, one clipped corner
   instead of a uniform rounded rect, and a very light paper-cream
   section background instead of flat white. This is the one place
   the design takes a real risk — everything else stays quiet.
   - `lg:grid-rows-2` keeps the hero exactly as tall as its sibling
     stack (fixes the v1 height mismatch).
   - Eyebrows (SOURCING, SPEED, PROMISE...) replace literal 01–06
     numbering since this content isn't a sequence — they read as
     tag categories instead, which a swing tag would actually have.
------------------------------------------------------------------- */

const Grommet = ({ tone = 'green' }) => {
  const styles = {
    green: { ring: 'border-[#1a3a32]', thread: 'text-[#1a3a32]/70', dot: 'bg-white' },
    orange: { ring: 'border-[#c0501a]', thread: 'text-[#c0501a]/70', dot: 'bg-white' },
    lime: { ring: 'border-[#c8f04a]', thread: 'text-[#c8f04a]/80', dot: 'bg-[#1a3a32]' },
  }[tone];

  return (
    <span className="absolute top-4 left-4 flex items-center gap-1.5 pointer-events-none">
      <span className={`w-3 h-3 rounded-full border-2 ${styles.ring} ${styles.dot} shadow-[inset_0_1px_2px_rgba(0,0,0,0.25)]`} />
      <svg width="28" height="12" viewBox="0 0 28 12" fill="none" className={styles.thread}>
        <path d="M1 1 Q 14 15 27 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    </span>
  );
};

const IconWrapDark = ({ icon, tone = 'green' }) => {
  const tones = {
    green: 'border-[#c9e0c0] bg-[#eaf4e5] text-[#3a6b3f]',
    lime: 'border-[#d9ecab] bg-[#f1f8e0] text-[#5c7a1e]',
    orange: 'border-[#f4d3ae] bg-[#fdeee0] text-[#c0501a]',
  };
  return (
    <div
      className={`
        w-[50px] h-[50px] rounded-[14px] flex items-center justify-center text-xl flex-shrink-0
        border-[1.5px] ${tones[tone]}
        transition-all duration-300 group-hover:bg-[#1a3a32] group-hover:border-[#1a3a32]
        group-hover:text-[#c8f04a] group-hover:-rotate-6 group-hover:scale-105
      `}
    >
      {icon}
    </div>
  );
};

const Eyebrow = ({ children, tone = 'green' }) => (
  <span
    className={`
      inline-flex items-center gap-1.5 text-[9.5px] font-black uppercase tracking-[0.22em]
      ${tone === 'green' ? 'text-[#7e9488]' : tone === 'lime' ? 'text-[#c8f04a]/70' : 'text-[#d3906a]'}
    `}
  >
    <span className={`w-3 h-[1.5px] rounded ${tone === 'green' ? 'bg-[#7e9488]' : tone === 'lime' ? 'bg-[#c8f04a]/70' : 'bg-[#d3906a]'}`} />
    {children}
  </span>
);

const PeekArrow = () => (
  <span className="absolute bottom-6 right-6 w-8 h-8 rounded-full bg-[#1a3a32] text-[#c8f04a] flex items-center justify-center text-[11px] opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
    <FaArrowRight />
  </span>
);

/* Tag shape: sharp top-left "punched" corner, soft everywhere else —
   the one clipped corner is what makes it read as a tag, not a card. */
const tagShape = "rounded-tl-[4px] rounded-tr-[24px] rounded-bl-[24px] rounded-br-[24px]";

const Features = () => {
  const { t } = useTranslation();

  const stats = [
    { n: '200+', l: t('home.statDishes', 'Dishes') },
    { n: '4.9★', l: t('home.statRating', 'Rating') },
    { n: '12K+', l: t('home.statCustomers', 'Customers') },
  ];

  return (
    <section className="w-full bg-[#faf8f2] py-20 px-6 lg:px-14 font-sans">
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

        {/* ─── Bento Grid ───
             lg:grid-rows-2 is the key fix: the hero (row-span-2) will
             always match the combined height of the 02/03 + 04 stack,
             instead of drifting apart at different content lengths. */}
        <div className="grid grid-cols-1 lg:grid-cols-3 lg:grid-rows-2 gap-4">

          {/* HERO CARD — Fresh Ingredients */}
          <div className={`group relative bg-[#1a3a32] ${tagShape} p-9 flex flex-col justify-between lg:row-span-2 overflow-hidden shadow-[0_10px_32px_-6px_rgba(26,58,50,0.35)] transition-all duration-300 hover:-translate-y-1 hover:rotate-[-0.4deg] hover:shadow-[0_20px_44px_-6px_rgba(26,58,50,0.45)]`}>
            <div
              className="absolute inset-0 opacity-[0.06] pointer-events-none"
              style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '18px 18px' }}
            />
            <Grommet tone="lime" />

            <div className="relative z-10">
              <Eyebrow tone="lime">{t('home.sourcingLabel', 'Sourcing')}</Eyebrow>
              <div className="w-16 h-16 rounded-[18px] bg-[#c8f04a]/15 flex items-center justify-center text-[#c8f04a] text-3xl mb-8 mt-3 transition-all duration-300 group-hover:bg-[#c8f04a] group-hover:text-[#1a3a32] group-hover:-rotate-8 group-hover:scale-110">
                <FaLeaf />
              </div>
              <h3 className="text-[28px] font-extrabold text-white uppercase tracking-tight leading-tight mb-3">
                {t('home.freshIngredients')}
              </h3>
              <p className="text-white/50 text-sm leading-relaxed max-w-[85%]">
                {t('home.freshIngredientsDesc')}
              </p>
            </div>

            <div className="relative z-10 inline-flex items-center gap-1.5 mt-7 -rotate-2 bg-[#c8f04a]/15 text-[#c8f04a] text-[11px] font-bold px-4 py-2 rounded-full tracking-wider transition-all duration-300 group-hover:bg-[#c8f04a] group-hover:text-[#1a3a32] w-fit">
              100% Organic
            </div>
          </div>

          {/* SMALL CARD — Fast Delivery */}
          <div className={`group relative bg-white border-[1.5px] border-[#e8ece5] ${tagShape} p-8 shadow-[0_6px_24px_-4px_rgba(26,58,50,0.1)] transition-all duration-300 hover:border-[#d0e8c8] hover:-translate-y-1 hover:rotate-[0.6deg] hover:shadow-[0_16px_36px_-6px_rgba(26,58,50,0.18)] overflow-hidden`}>
            <Grommet />
            <Eyebrow>{t('home.speedLabel', 'Speed')}</Eyebrow>
            <IconWrapDark icon={<MdDeliveryDining />} tone="lime" />
            <h3 className="mt-5 text-[16px] font-extrabold text-[#1a3a32] uppercase tracking-wide mb-2 transition-colors duration-300 group-hover:text-[#e07020]">
              {t('home.fastDelivery')}
            </h3>
            <p className="text-[12.5px] text-gray-400 leading-relaxed pr-6">{t('home.fastDeliveryDesc')}</p>
            <PeekArrow />
          </div>

          {/* SMALL CARD — Quality */}
          <div className={`group relative bg-white border-[1.5px] border-[#e8ece5] ${tagShape} p-8 shadow-[0_6px_24px_-4px_rgba(26,58,50,0.1)] transition-all duration-300 hover:border-[#d0e8c8] hover:-translate-y-1 hover:rotate-[-0.6deg] hover:shadow-[0_16px_36px_-6px_rgba(26,58,50,0.18)] overflow-hidden`}>
            <Grommet />
            <Eyebrow>{t('home.promiseLabel', 'Promise')}</Eyebrow>
            <IconWrapDark icon={<FaShieldAlt />} tone="green" />
            <h3 className="mt-5 text-[16px] font-extrabold text-[#1a3a32] uppercase tracking-wide mb-2 transition-colors duration-300 group-hover:text-[#e07020]">
              {t('home.qualityGuaranteed')}
            </h3>
            <p className="text-[12.5px] text-gray-400 leading-relaxed pr-6">{t('home.qualityGuaranteedDesc')}</p>
            <PeekArrow />
          </div>

          {/* WIDE CARD — Made with Love */}
          <div className={`group relative lg:col-span-2 bg-[#fff9f5] border-[1.5px] border-[#fde8d8] ${tagShape} p-8 flex flex-col justify-center shadow-[0_6px_24px_-4px_rgba(224,112,32,0.08)] transition-all duration-300 hover:bg-white hover:border-[#f4c4a0] hover:-translate-y-1 hover:rotate-[-0.3deg] hover:shadow-[0_16px_36px_-6px_rgba(224,112,32,0.15)] overflow-hidden`}>
            <Grommet tone="orange" />
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 rounded-[18px] bg-white border-2 border-[#fde8d8] flex items-center justify-center text-[#e07020] text-2xl flex-shrink-0 transition-all duration-300 group-hover:bg-[#e07020] group-hover:border-[#e07020] group-hover:text-white group-hover:scale-110">
                <FaHeart />
              </div>
              <div>
                <Eyebrow tone="orange">{t('home.heritageLabel', 'Heritage')}</Eyebrow>
                <h3 className="text-[18px] font-extrabold text-[#1a3a32] uppercase tracking-wide mb-2 transition-colors duration-300 group-hover:text-[#e07020]">
                  {t('home.madeWithLove')}
                </h3>
                <p className="text-[13px] text-[#b09d8d] leading-relaxed">{t('home.madeWithLoveDesc')}</p>
                <span className="mt-3 inline-flex items-center gap-1.5 -rotate-2 bg-[#fde8d8] text-[#c05010] text-[11px] font-bold px-3 py-1.5 rounded-full">
                  Family Recipes Since 1985
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ─── Bottom Row ─── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div className={`group relative flex items-center gap-5 bg-white border-[1.5px] border-[#e8ece5] ${tagShape} p-7 shadow-[0_6px_24px_-4px_rgba(26,58,50,0.1)] transition-all duration-300 hover:border-[#d0e8c8] hover:-translate-y-1 hover:rotate-[0.5deg] hover:shadow-[0_16px_36px_-6px_rgba(26,58,50,0.18)] overflow-hidden`}>
            <Grommet />
            <IconWrapDark icon={<FaClock />} tone="lime" />
            <div>
              <Eyebrow>{t('home.availabilityLabel', 'Availability')}</Eyebrow>
              <h3 className="text-[15px] font-extrabold text-[#1a3a32] uppercase tracking-wide mb-1 transition-colors duration-300 group-hover:text-[#e07020]">
                {t('home.open247')}
              </h3>
              <p className="text-[12.5px] text-gray-400 leading-relaxed">{t('home.open247Desc')}</p>
            </div>
            <PeekArrow />
          </div>
          <div className={`group relative flex items-center gap-5 bg-white border-[1.5px] border-[#f6e3d3] ${tagShape} p-7 shadow-[0_6px_24px_-4px_rgba(224,112,32,0.1)] transition-all duration-300 hover:border-[#f4c4a0] hover:-translate-y-1 hover:rotate-[-0.5deg] hover:shadow-[0_16px_36px_-6px_rgba(224,112,32,0.18)] overflow-hidden`}>
            <Grommet tone="orange" />
            <IconWrapDark icon={<FaCommentAlt />} tone="orange" />
            <div>
              <Eyebrow tone="orange">{t('home.craftLabel', 'Craft')}</Eyebrow>
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