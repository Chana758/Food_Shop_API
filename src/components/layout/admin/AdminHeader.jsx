import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LuMenu, LuSearch, LuMail, LuBell, LuX, LuCircleCheckBig } from 'react-icons/lu';
import ch1 from '../../../assets/image/channa.jpg';
import { useAuth } from '../../../context/AuthContext';
import useAdminBell from '../../../hooks/useAdminBell';
import useEcho from '../../../hooks/useEcho';

const AdminHeader = ({ title, searchTerm, setSearchTerm, toggleSidebar, placeholder = 'Search menu...' }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const userName = user?.name || 'Guest';
  const userRole = user?.role || 'staff';

  const [bellOpen, setBellOpen] = useState(false);
  const bellRef = useRef(null);

  const { items, totalCount, loading, refresh } = useAdminBell();
  const unreadMailCount = items.find(i => i.id === 'contacts')?.count ?? 0;

  useEcho(null, { onAnyChange: refresh });

  const getInitials = (name) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (bellRef.current && !bellRef.current.contains(e.target)) {
        setBellOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleItemClick = (item) => {
    setBellOpen(false);
    navigate(item.link);
  };

  return (
    // ✅ FIXED — background reads --header-bg (solid accent when
    // theme_target === 'sidebar', fixed white/navy otherwise). The bug
    // reported: background was changing but every text/icon below was
    // still hardcoded to text-gray-600 / text-[#1e292b], so on a colored
    // header those stayed unreadable. Every text/icon in this file now
    // reads --header-fg / --header-fg-muted instead, which
    // SettingsContext.jsx flips to white when the header becomes a
    // solid accent color, and back to normal dark/light text otherwise.
    <header
      style={{ background: 'var(--header-bg)' }}
      className="sticky top-0 z-50 shadow-sm border-b border-black/5 px-6 py-4 flex justify-between items-center transition-colors duration-300"
    >
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg transition-colors hover:bg-black/5"
        >
          <LuMenu size={20} style={{ color: 'var(--header-fg)' }} />
        </button>
        <h1 className="text-xl font-bold" style={{ color: 'var(--header-fg)' }}>{title}</h1>
      </div>

      <div className="flex-1 max-w-sm mx-6">
        <div className="relative flex items-center">
          <LuSearch className="absolute left-3" size={16} style={{ color: 'var(--header-fg-muted)' }} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={placeholder}
            style={{
              '--tw-ring-color': 'var(--header-accent)',
              background: 'color-mix(in srgb, var(--header-bg) 85%, white 15%)',
              color: 'var(--header-fg)',
              borderColor: 'color-mix(in srgb, var(--header-fg) 15%, transparent)',
            }}
            className="w-full pl-10 pr-12 py-2 border rounded-full text-sm focus:outline-none focus:ring-2 placeholder:opacity-60"
          />

          {searchTerm ? (
            <button
              onClick={() => setSearchTerm('')}
              type="button"
              className="absolute right-3 p-1 rounded-full transition-colors hover:bg-black/10"
              title="Clear search"
            >
              <LuX size={14} style={{ color: 'var(--header-fg-muted)' }} />
            </button>
          ) : (
            <span
              className="absolute right-3 text-[10px] px-1.5 py-0.5 rounded font-bold"
              style={{ background: 'color-mix(in srgb, var(--header-fg) 12%, transparent)', color: 'var(--header-fg-muted)' }}
            >
              ⌘ F
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/admin/contacts')}
          className="relative p-2 rounded-full transition-colors hover:bg-black/5"
          title="Contact Messages"
        >
          <LuMail size={20} style={{ color: 'var(--header-fg)' }} />
          {unreadMailCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center bg-red-500 text-white text-[10px] font-black rounded-full">
              {unreadMailCount > 9 ? '9+' : unreadMailCount}
            </span>
          )}
        </button>

        <div className="relative" ref={bellRef}>
          <button
            onClick={() => setBellOpen(prev => !prev)}
            className="relative p-2 rounded-full transition-colors hover:bg-black/5"
            title="Action Items"
          >
            <LuBell size={20} style={{ color: 'var(--header-fg)' }} />
            {totalCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center bg-red-500 text-white text-[10px] font-black rounded-full">
                {totalCount > 9 ? '9+' : totalCount}
              </span>
            )}
          </button>

          {/* Dropdown panel intentionally stays on a fixed white/navy
              surface (not --header-bg) — a solid-accent-color header bar
              is fine, but a whole dropdown panel painted in a bright
              accent would hurt readability of the list content inside
              it, so this one keeps the app's normal light/dark surface. */}
          {bellOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-[#1E2A2E] rounded-xl border border-gray-100 dark:border-[#32444A] shadow-xl overflow-hidden z-50">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-50 dark:border-[#243338]">
                <p className="text-sm font-black text-[#1e292b] dark:text-[#FBF9F5]">Action Items</p>
                <button
                  onClick={refresh}
                  className="text-[11px] font-bold text-gray-400 dark:text-[#7C8A8D] hover:text-[var(--accent)] transition-colors"
                >
                  Refresh
                </button>
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-gray-50 dark:divide-[#243338]">
                {loading ? (
                  <div className="p-8 text-center text-xs text-gray-400 dark:text-[#7C8A8D] font-bold uppercase tracking-widest animate-pulse">
                    Loading...
                  </div>
                ) : items.length === 0 ? (
                  <div className="p-8 text-center space-y-2">
                    <LuCircleCheckBig size={24} className="text-green-300 mx-auto" />
                    <p className="text-xs text-gray-400 dark:text-[#7C8A8D] font-bold uppercase tracking-widest">All caught up!</p>
                  </div>
                ) : (
                  items.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleItemClick(item)}
                      className={`px-4 py-3 cursor-pointer hover:bg-gray-50/70 dark:hover:bg-[#243338] transition-colors flex gap-2.5 ${item.bg}`}
                    >
                      <div className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${item.dot}`} />
                      <div className="min-w-0 flex-1">
                        <p className={`text-xs font-black truncate ${item.color}`}>
                          {item.title}
                        </p>
                        <p className="text-[11px] text-gray-500 dark:text-[#9AA5A3] truncate">{item.sub}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div
          className="flex items-center gap-3 border-l pl-4"
          style={{ borderColor: 'color-mix(in srgb, var(--header-fg) 15%, transparent)' }}
        >
          <div className="text-right">
            <p className="text-xs font-bold" style={{ color: 'var(--header-fg)' }}>{userName}</p>
            <p className="text-[10px] capitalize" style={{ color: 'var(--header-fg-muted)' }}>{userRole}</p>
          </div>

          {userRole.toLowerCase() === 'admin' ? (
            <img
              className="w-9 h-9 rounded-full object-cover border"
              style={{ borderColor: 'color-mix(in srgb, var(--header-fg) 20%, transparent)' }}
              src={ch1}
              alt="Profile"
            />
          ) : (
            <div
              style={{ background: 'color-mix(in srgb, var(--header-fg) 20%, transparent)', color: 'var(--header-fg)' }}
              className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold"
            >
              {getInitials(userName)}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;