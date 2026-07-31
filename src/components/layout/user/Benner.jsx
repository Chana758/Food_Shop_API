// src/components/user/Benner.jsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import Amok from '../../../assets/image/A2.jpg';
import 'animate.css';
import { Link } from 'react-router-dom';
import { FaArrowRight, FaLeaf } from 'react-icons/fa';
import { IoSearch } from 'react-icons/io5';

/* ------------------------------------------------------------------
   Same token system as Navbar.jsx:
   ink #17242A · palm #2F5233 · turmeric #E3A73A · kroeung #C1502E
   Signature element: a slow-rotating "certified fresh" market stamp,
   plus a torn awning edge closing the section — echoes a market
   stall canopy rather than a generic hero underline.
------------------------------------------------------------------- */

const FONT_IMPORT = `@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&family=Work+Sans:wght@400;500;600&family=JetBrains+Mono:wght@500;600&display=swap');
@keyframes stampSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
.stamp-spin { animation: stampSpin 14s linear infinite; }`;

const Benner = () => {
  const { t } = useTranslation();

  return (
    // កែសម្រួលកម្ពស់ទីនេះ ពី lg:h-[92vh] មកជា lg:h-[calc(100vh-88px)] ដើម្បីឱ្យវាបំពេញលំហស្អាតជាមួយ Navbar ទំហំ 88px របស់អ្នក
    <div className="relative w-full h-[540px] sm:h-[600px] lg:h-[calc(100vh-88px)] min-h-[650px] overflow-hidden flex items-center" style={{ fontFamily: "'Work Sans', sans-serif" }}>
      <style>{FONT_IMPORT}</style>

      {/* Background image */}
      <img
        src={Amok}
        alt="Banner Background"
        className="absolute inset-0 w-full h-full object-cover object-center"
      />

      {/* Ink gradient overlay — ធ្វើឱ្យដិតបន្តិចខាងឆ្វេង ដើម្បីធានាថាអអត្ថបទងាយស្រួលអាន */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#17242A]/95 via-[#17242A]/75 to-[#17242A]/30"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-[#17242A]/60 via-transparent to-transparent"></div>

      {/* Banner content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-10 md:px-12 lg:px-20 flex flex-col items-start space-y-5 sm:space-y-6 pt-4 animate__animated animate__fadeInLeft">

        {/* Eyebrow label */}
        <p className="text-[#E3A73A] text-[10px] sm:text-[11px] font-semibold tracking-[0.25em] sm:tracking-[0.35em] uppercase flex items-center gap-2 sm:gap-3" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
          <span className="w-5 sm:w-6 h-[1px] bg-[#E3A73A]"></span>
          Fresh From The Khmer-Fresh Market
        </p>

        {/* Heading */}
        <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-[68px] font-bold text-white leading-[1.08] tracking-tight uppercase" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          Discover Food Taste <br />
          Our{' '}
          <span className="relative inline-block text-[#E3A73A]">
            Best
            <svg
              className="absolute left-0 -bottom-1.5 w-full"
              height="12"
              viewBox="0 0 120 14"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <path d="M2 9 C 30 2, 90 2, 118 9" stroke="#E3A73A" strokeWidth="5" fill="none" strokeLinecap="round" />
            </svg>
          </span>{' '}
          Healthy & <br />
          Tasty.
        </h1>

        {/* Description */}
        <p className="text-white/85 text-xs sm:text-sm md:text-base max-w-md sm:max-w-lg leading-relaxed font-normal">
          This is a type of restaurant which typically serves food and drink,
          in light refreshments such as baked goods or snacks.
        </p>

        {/* Action buttons */}
        <div className="flex flex-row gap-3 sm:gap-4 pt-3 w-full sm:w-auto">

          <Link to="/menu" className="flex-1 sm:flex-none">
            <button className="w-full sm:w-auto group px-6 sm:px-8 py-3.5 bg-[#2F5233] text-white rounded-full font-semibold flex items-center justify-center gap-2 hover:bg-[#E3A73A] hover:text-[#17242A] transition-all duration-300 shadow-lg active:scale-95 uppercase text-[11.5px] sm:text-[13px] tracking-widest" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
              Explore Menu
              <FaArrowRight size={11} className="transition-transform duration-300 group-hover:translate-x-1" />
            </button>
          </Link>

          <Link to="/search" className="flex-1 sm:flex-none">
            <button className="w-full sm:w-auto px-6 sm:px-8 py-3.5 bg-transparent border border-white/40 text-white rounded-full font-semibold flex items-center justify-center gap-2 hover:border-white hover:bg-white/10 transition-all duration-300 uppercase text-[11.5px] sm:text-[13px] tracking-widest" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
              <IoSearch size={15} />
              Search Dishes
            </button>
          </Link>

        </div>
      </div>

      {/* Signature: rotating market stamp badge */}
      <div className="hidden md:flex absolute right-12 lg:right-24 bottom-24 lg:bottom-28 z-10 w-28 h-28 rounded-full bg-[#F6F1E3]/95 border-2 border-[#C1502E] items-center justify-center shadow-2xl">
        <svg viewBox="0 0 100 100" className="absolute inset-0 stamp-spin">
          <defs>
            <path id="stampCircle" d="M 50,50 m -38,0 a 38,38 0 1,1 76,0 a 38,38 0 1,1 -76,0" />
          </defs>
          <text fill="#C1502E" fontSize="8.2" fontWeight="600" letterSpacing="2" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
            <textPath href="#stampCircle" startOffset="0%">
              · 100% ORGANIC · FRESH DAILY
            </textPath>
          </text>
        </svg>
        <FaLeaf className="text-[#2F5233] text-2xl relative z-10" />
      </div>

      {/* Torn awning edge closing the section */}
      <div
        className="absolute bottom-0 left-0 w-full h-5 sm:h-7 md:h-9 bg-[#F6F1E3]"
        style={{
          clipPath:
            'polygon(0% 100%, 0% 40%, 4% 0%, 8% 40%, 12% 0%, 16% 40%, 20% 0%, 24% 40%, 28% 0%, 32% 40%, 36% 0%, 40% 40%, 44% 0%, 48% 40%, 52% 0%, 56% 40%, 60% 0%, 64% 40%, 68% 0%, 72% 40%, 76% 0%, 80% 40%, 84% 0%, 88% 40%, 92% 0%, 96% 40%, 100% 0%, 100% 100%)',
        }}
      ></div>
    </div>
  );
};

export default Benner;