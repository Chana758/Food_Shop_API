import React from 'react';
import { useTranslation } from 'react-i18next';
import Amok from '../../../assets/image/A2.jpg';
import 'animate.css';
import { Link } from "react-router-dom";

const Benner = () => {
  const { t } = useTranslation();
  
  return (
    // ដាក់ relative ដើម្បីឱ្យកូនៗនៅខាងក្នុងអាចពង្រីកពេញបាន
    <div className='relative w-full h-[500px] lg:h-[90vh] overflow-hidden flex items-center'>
      
      {/* រូបភាពពេញផ្ទៃ (Background Image) */}
      <img
        src={Amok}
        alt="Banner Background"
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Overlay ងងឹតបន្តិច ដើម្បីឱ្យអក្សរមើលឃើញច្បាស់ */}
      <div className="absolute inset-0 bg-black/20"></div>

      {/* Content (អត្ថបទនៅខាងលើរូបភាព) */}
      <div className='relative z-10 w-full max-w-7xl mx-auto px-6 md:px-10 lg:px-24 flex flex-col items-start space-y-6 animate__animated animate__fadeInLeft'>
        <h1 className="text-5xl md:text-6xl lg:text-5xl font-bold text-white leading-[1.1]">
          Discover Food Taste <br />
          Our <span className="text-[#F58220]">Best</span> Healthy & <br /> Tasty.
        </h1>

        <p className="text-white/90 text-lg max-w-md leading-relaxed">
          This is a type of restaurant which typically serves food and drink, in light refreshments such as baked goods or snacks.
        </p>

        <div className="flex gap-4 pt-4">
          <Link to="/menu">
            <button className="px-8 py-3 bg-[#2d5a27] text-white rounded-full font-semibold hover:bg-[#F58220] transition-all duration-300 shadow-lg active:scale-95">
              Explore food
            </button>
          </Link>
          <Link to="/search">
            <button className="px-8 py-3 border bg-amber-600 border-white text-white rounded-full font-semibold hover:bg-white/20 transition-all">
              🔍 Search
            </button>
        </Link>
        </div>
      </div>
    </div>
  );
};

export default Benner;