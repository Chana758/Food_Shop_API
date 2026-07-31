// src/components/user/Navbar.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { menu } from '../../../data';
import axiosInstance from '../../../api/axios';
import { IoSearch, IoCloseSharp, IoHomeOutline, IoFastFoodOutline, IoInformationCircleOutline, IoCallOutline, IoGlobeOutline } from "react-icons/io5";
import { FaRegHeart, FaRegUser, FaBars, FaLeaf, FaSignOutAlt, FaChevronRight } from "react-icons/fa";
import { HiOutlineShoppingCart } from "react-icons/hi";
import LanguageSwitcher from '../../common/LanguageSwitcher';
import { useAuth } from '../../../context/AuthContext';

/* ------------------------------------------------------------------
   Design tokens (Khmer-Fresh market identity)
   ink        #17242A  charcoal-navy, structure/utility bar
   palm       #2F5233  leaf green, primary action
   turmeric   #E3A73A  saffron gold, accents / counts
   kroeung    #C1502E  spiced clay red, alerts / active state
   ricepaper  #F6F1E3  warm cream, light surfaces
   Fonts: Space Grotesk (display/wordmark), Work Sans (everything else)
------------------------------------------------------------------- */

const FONT_IMPORT = `@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@600;700&family=Work+Sans:wght@400;500;600;700&display=swap');`;

const Navbar = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  const { user: currentUser, logout: authLogout } = useAuth();

  const [openSidebar, setOpenSidebar]         = useState(false);
  const [openSearch, setOpenSearch]           = useState(false);
  const [openUserDropdown, setOpenUserDropdown] = useState(false);
  const [favoritesCount, setFavoritesCount]   = useState(0);
  const [cartCount, setCartCount]             = useState(0);
  const [searchInput, setSearchInput]         = useState('');

  // Handle clicking outside to close the user profile dropdown menu
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpenUserDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch and update counts for favorite items and shopping cart items dynamically
  useEffect(() => {
    const updateCounts = async () => {
      if (currentUser) {
        try {
          const res = await axiosInstance.get('/favorites');
          setFavoritesCount((res.data.data || []).length);
        } catch {
          setFavoritesCount(0);
        }
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        setCartCount(cart.reduce((sum, item) => sum + item.quantity, 0));
      } else {
        setFavoritesCount(0);
        setCartCount(0);
      }
    };
    updateCounts();
    window.addEventListener('favoritesUpdated', updateCounts);
    window.addEventListener('cartUpdated', updateCounts);
    return () => {
      window.removeEventListener('favoritesUpdated', updateCounts);
      window.removeEventListener('cartUpdated', updateCounts);
    };
  }, [currentUser]);

  // Determine whether a navigation route is currently active
  const isActive = (path) => {
    const noHighlight = ['/favorites', '/cart', '/checkout', '/order-success', '/order-history'];
    if (noHighlight.includes(location.pathname)) return false;
    return location.pathname === path;
  };

  // Assign corresponding icons to each navigation menu key
  const getMenuIcon = (key) => {
    switch (key) {
      case 'nav.home':    return <IoHomeOutline size={17} />;
      case 'nav.menu':    return <IoFastFoodOutline size={17} />;
      case 'nav.about':   return <IoInformationCircleOutline size={17} />;
      case 'nav.contact': return <IoCallOutline size={17} />;
      default:            return null;
    }
  };

  // Handle user logout and clear local storage details
  const handleLogout = () => {
    authLogout();
    localStorage.removeItem('cart');
    localStorage.removeItem('favorites');
    setCartCount(0);
    setFavoritesCount(0);
    setOpenSidebar(false);
    setOpenUserDropdown(false);
    navigate('/');
  };

  return (
    <nav className="w-full sticky top-0 z-50 shadow-sm" style={{ fontFamily: "'Work Sans', sans-serif" }}>
      <style>{FONT_IMPORT}</style>

      {/* Top Bar Desktop - កែសម្រួលឱ្យស្តើងជាងមុន py-1.5 ដើម្បីកុំឱ្យក្រាស់ពេក */}
      <div className="hidden xl:block w-full bg-[#17242A] py-1.5 px-14">
        <div className="flex justify-between items-center text-white/70 text-[12px] font-medium">
          <div className="flex items-center gap-4">
            <p className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Welcome to Khmer-Fresh Organic Market
            </p>
            <div className="h-3 w-[1px] bg-white/15"></div>
            <p className="text-[#E3A73A] font-semibold flex items-center gap-1.5"><IoCallOutline size={13} /> +855 972 325 094</p>
          </div>

          <div className="flex items-center gap-3 bg-white/[0.06] hover:bg-white/10 border border-white/10 rounded-full pl-3 pr-1 py-0.5 transition-colors">
            <div className="flex items-center gap-1.5 text-white/80 text-[11px] font-bold tracking-wider uppercase">
              <IoGlobeOutline size={13} className="text-[#E3A73A]" />
              <span>Language:</span>
            </div>
            <div className="scale-90">
              <LanguageSwitcher />
            </div>
          </div>
        </div>
      </div>

      {/* Main Nav */}
      <div className="w-full h-[78px] px-5 lg:px-14 flex items-center justify-between border-b border-[#17242A]/8 bg-white relative">

        {/* Logo Section */}
        <Link to='/' className="flex items-center gap-3 shrink-0 group">
          <div className="relative w-11 h-11 shrink-0 rounded-full border-2 border-[#2F5233] flex items-center justify-center transition-transform duration-500 group-hover:-rotate-6">
            <div className="absolute inset-[2px] rounded-full border border-dashed border-[#2F5233]/30"></div>
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#2F5233] to-[#17242A] flex items-center justify-center shadow-inner">
              <FaLeaf className="text-[#E3A73A] text-[11px]" />
            </div>
          </div>
          
          <div className="flex flex-col leading-tight">
            <span
              className="relative flex items-center gap-1 md:text-[19px] text-lg font-extrabold text-[#17242A] tracking-tight uppercase"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              <span>Khmer</span>
              <span className="text-[#C1502E] text-xs px-0.5">•</span>
              <span className="text-[#2F5233]">Fresh</span>
            </span>

            {/* បន្ទាត់ខ័ណ្ឌក្រោម Logo ត្រូវបានលុប ឬសម្រួលឱ្យសាមញ្ញស្អាតស្អំជាងមុន */}
            <div className="w-full flex items-center justify-center my-0.5">
              <div className="h-[1.5px] w-full bg-gradient-to-r from-transparent via-[#E3A73A]/60 to-transparent rounded-full"></div>
            </div>

            <span className="text-[8px] font-bold text-[#C1502E] tracking-[0.2em] uppercase text-center">
              Authentic Taste
            </span>
          </div>
        </Link>

        {/* Center links */}
        <ul className="hidden xl:flex items-center gap-1.5 mx-auto bg-[#ECE5D3] p-1.5 rounded-full border border-[#17242A]/10 shadow-inner">
          {menu.map((u) => (
            <li key={u.id}>
              {isActive(u.link) ? (
                <Link
                  to={u.link}
                  className="text-[13px] font-bold flex items-center gap-2 px-5 py-2 rounded-full bg-[#2F5233] text-white shadow-md shadow-[#2F5233]/25 transition-all"
                >
                  {getMenuIcon(u.key)}<span>{t(u.key)}</span>
                </Link>
              ) : (
                <Link
                  to={u.link}
                  className="group text-[13px] font-semibold flex items-center gap-2 px-4 py-2 rounded-full text-[#17242A]/70 hover:bg-white hover:text-[#2F5233] hover:shadow-sm transition-all duration-300"
                >
                  {getMenuIcon(u.key)}<span>{t(u.key)}</span>
                </Link>
              )}
            </li>
          ))}
        </ul>

        {/* Actions - Combined nicely inside a single unified container box */}
        <div className="flex items-center gap-2">
          <div className="hidden xl:flex items-center bg-[#ECE5D3] border border-[#17242A]/10 p-1.5 rounded-full shadow-inner gap-1">
            <button onClick={() => setOpenSearch(!openSearch)} className="p-2 rounded-full text-[#17242A]/70 hover:bg-white hover:text-[#2F5233] transition-all focus:outline-none shadow-sm">
              <IoSearch size={17} />
            </button>

            <Link to="/favorites" className="relative p-2 rounded-full text-[#17242A]/70 hover:bg-white hover:text-[#C1502E] transition-all shadow-sm">
              <FaRegHeart size={16} />
              {favoritesCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#C1502E] text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full font-bold border-2 border-white ring-2 ring-[#E3A73A]/60 shadow-sm">
                  {favoritesCount}
                </span>
              )}
            </Link>

            <Link to="/cart" className="relative p-2 rounded-full text-[#17242A]/70 hover:bg-white hover:text-[#2F5233] transition-all shadow-sm">
              <HiOutlineShoppingCart size={18} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#2F5233] text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full font-bold border-2 border-white ring-2 ring-[#E3A73A]/60 shadow-sm">
                  {cartCount}
                </span>
              )}
            </Link>

            <div className="h-4 w-[1px] bg-[#17242A]/10 mx-1"></div>

            {currentUser ? (
              <div className="relative" ref={dropdownRef}>
                <button onClick={() => setOpenUserDropdown(!openUserDropdown)}
                  className="flex items-center gap-2 bg-white hover:bg-[#2F5233] hover:text-white pl-1 pr-3 py-1 rounded-full border border-[#17242A]/10 transition-colors focus:outline-none shadow-sm group">
                  <span className="w-6 h-6 rounded-full bg-[#2F5233] text-white group-hover:bg-white group-hover:text-[#2F5233] text-[10px] font-bold flex items-center justify-center transition-colors">
                    {currentUser.name?.charAt(0).toUpperCase() || 'U'}
                  </span>
                  <span className="text-[#17242A] group-hover:text-white font-semibold text-[13px] transition-colors">{currentUser.name || 'Guest'}</span>
                </button>
                <div className={`absolute right-0 top-full pt-3 z-50 transition-all duration-300 ${openUserDropdown ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-2'}`}>
                  <div className="bg-white shadow-2xl rounded-xl py-1 w-52 border border-black/5 overflow-hidden">
                    <div className="px-4 py-3 border-b border-black/5 bg-[#F6F1E3]/60">
                      <p className="text-[11px] text-[#17242A]/50 truncate">{currentUser.email}</p>
                    </div>
                    <button onClick={handleLogout}
                      className="w-full text-left px-4 py-3 hover:bg-[#C1502E] hover:text-white text-[#C1502E] transition-colors flex items-center gap-2 font-semibold text-sm">
                      <FaSignOutAlt size={13} /> {t('nav.logout')}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <Link to="/login" className="flex items-center gap-2 bg-[#2F5233] hover:bg-[#17242A] text-white font-semibold text-[13px] px-3.5 py-1.5 rounded-full transition-colors shadow-sm">
                <FaRegUser size={12} /> {t('nav.login')}
              </Link>
            )}
          </div>

          {/* Mobile search button */}
          <button onClick={() => setOpenSearch(!openSearch)} className="xl:hidden p-2.5 rounded-full text-[#17242A]/70 bg-[#ECE5D3] hover:bg-white transition-all focus:outline-none shadow-sm">
            <IoSearch size={18} />
          </button>

          {/* Mobile cart button */}
          <Link to="/cart" className="xl:hidden relative p-2.5 rounded-full text-[#17242A]/70 bg-[#ECE5D3] hover:bg-white transition-all shadow-sm">
            <HiOutlineShoppingCart size={19} />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#2F5233] text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full font-bold border-2 border-white ring-2 ring-[#E3A73A]/60">
                {cartCount}
              </span>
            )}
          </Link>

          <button onClick={() => setOpenSidebar(true)} className="xl:hidden p-2.5 rounded-full text-[#17242A] bg-[#ECE5D3] hover:bg-white focus:outline-none shadow-sm">
            <FaBars size={20} />
          </button>
        </div>

        {/* Signature rule - បន្ទាត់ក្រោនស្អាតទាក់ទាញជាងមុន */}
        <div className="absolute bottom-0 left-0 w-full h-[2.5px] bg-gradient-to-r from-[#2F5233] via-[#E3A73A] to-[#C1502E]"></div>
      </div>

      {/* Sidebar Overlay */}
      <div className={`fixed inset-0 bg-[#17242A]/70 backdrop-blur-sm z-[100] xl:hidden transition-opacity duration-500 ${openSidebar ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setOpenSidebar(false)}></div>

      {/* Sidebar Panel */}
      <div className={`w-[300px] h-screen fixed z-[110] top-0 left-0 bg-white xl:hidden shadow-2xl transition-transform duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${openSidebar ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="w-full h-[170px] bg-[#17242A] p-6 flex flex-col justify-between relative overflow-hidden text-white">
          <div className="absolute -right-8 -bottom-8 w-40 h-40 rounded-full border border-dashed border-white/10"></div>
          <div className="flex justify-between items-start relative z-10">
            <div className="w-11 h-11 rounded-full border-2 border-[#E3A73A] flex items-center justify-center">
              <FaLeaf size={16} className="text-[#E3A73A]" />
            </div>
            <button onClick={() => setOpenSidebar(false)} className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center hover:bg-[#C1502E] transition-all focus:outline-none">
              <IoCloseSharp size={20} />
            </button>
          </div>
          <div className="relative z-10 uppercase">
            <h2 className="text-2xl font-bold tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>KHMER-FRESH</h2>
            <p className="text-[#E3A73A] text-[10px] font-semibold mt-1 tracking-[0.25em]">Authentic Taste</p>
          </div>
        </div>

        <div className="flex flex-col h-[calc(100vh-170px)] justify-between">
          <div className="overflow-y-auto py-5 px-4">
            <ul className="space-y-1">
              {menu.map((u) => (
                <li key={u.id}>
                  <Link to={u.link}
                    className={`flex items-center justify-between px-4 py-3.5 rounded-lg font-semibold transition-all border-l-[3px] ${isActive(u.link) ? 'bg-[#F6F1E3] border-[#C1502E] text-[#17242A]' : 'border-transparent text-[#17242A]/60 hover:bg-[#F6F1E3]/60'}`}
                    onClick={() => setOpenSidebar(false)}>
                    <div className="flex items-center gap-4">{getMenuIcon(u.key)}<span className="text-[13.5px] uppercase tracking-wide">{t(u.key)}</span></div>
                    <FaChevronRight size={10} className={isActive(u.link) ? 'text-[#C1502E]' : 'opacity-20'} />
                  </Link>
                </li>
              ))}
              
              <li className="mt-3 pt-3 border-t border-black/5">
                <Link to="/favorites"
                  className={`flex items-center justify-between px-4 py-3.5 rounded-lg font-semibold transition-all border-l-[3px] ${location.pathname === '/favorites' ? 'bg-[#C1502E]/10 border-[#C1502E] text-[#C1502E]' : 'border-transparent text-[#17242A]/60 hover:bg-[#C1502E]/5'}`}
                  onClick={() => setOpenSidebar(false)}>
                  <div className="flex items-center gap-4">
                    <FaRegHeart size={17} />
                    <span className="text-[13.5px] uppercase tracking-wide">{t('nav.favorites')}</span>
                  </div>
                  {favoritesCount > 0 && (
                    <span className="text-[9px] w-5 h-5 flex items-center justify-center rounded-full font-bold bg-[#C1502E] text-white">{favoritesCount}</span>
                  )}
                </Link>
              </li>
            </ul>

            <div className="mt-6 pt-5 border-t border-black/5 px-2 flex justify-between items-center">
              <span className="text-[10px] font-semibold text-[#17242A]/40 uppercase tracking-[0.2em]">Language</span>
              <div className="scale-90"><LanguageSwitcher /></div>
            </div>
          </div>

          <div className="p-6 bg-[#F6F1E3] border-t border-black/5">
            {currentUser ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-2 bg-white rounded-xl border border-black/5">
                  <div className="w-11 h-11 bg-[#2F5233] rounded-full flex items-center justify-center text-white font-bold text-lg" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    {currentUser.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="overflow-hidden leading-tight text-[#17242A]">
                    <p className="text-sm font-bold truncate">{currentUser.name}</p>
                    <p className="text-[10px] text-[#17242A]/50 truncate">{currentUser.email}</p>
                  </div>
                </div>
                <button onClick={handleLogout}
                  className="w-full py-3.5 bg-white text-[#C1502E] border border-[#C1502E]/20 rounded-xl font-bold text-xs uppercase tracking-widest focus:outline-none hover:bg-[#C1502E] hover:text-white transition-colors">
                  <FaSignOutAlt className="inline mr-2" size={12} /> {t('nav.logout')}
                </button>
              </div>
            ) : (
              <Link to="/login" onClick={() => setOpenSidebar(false)}
                className="w-full py-3.5 bg-[#2F5233] text-white rounded-xl font-bold text-sm flex justify-center items-center gap-2 uppercase tracking-widest hover:bg-[#17242A] transition-colors">
                <FaRegUser size={13} /> {t('nav.login')}
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Search Overlay */}
      <div className={`w-full z-[120] absolute top-0 left-0 bg-[#F6F1E3] border-b-2 border-[#2F5233] transition-all duration-500 ${openSearch ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'}`}>
        <div className="w-full px-6 py-12 flex flex-col items-center relative">
          <p className="text-[10px] font-semibold text-[#C1502E] tracking-[0.3em] uppercase mb-3">Search the market</p>
          <form onSubmit={(e) => { e.preventDefault(); if (searchInput.trim()) { navigate(`/search?q=${encodeURIComponent(searchInput)}`); setSearchInput(''); setOpenSearch(false); } }} className="relative w-full max-w-2xl">
            <IoSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-2xl text-[#2F5233]" />
            <input type="text" value={searchInput} onChange={(e) => setSearchInput(e.target.value)}
              className="w-full h-14 border-2 border-[#17242A]/10 bg-white px-5 pl-14 rounded-full outline-none focus:border-[#2F5233] shadow-xl text-lg font-medium"
              style={{ fontFamily: "'Work Sans', sans-serif" }}
              placeholder={t('nav.search')} autoFocus />
          </form>
          <IoCloseSharp onClick={() => setOpenSearch(false)}
            className="text-[#17242A] absolute text-3xl top-6 right-6 cursor-pointer hover:rotate-90 transition-transform duration-300" />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;