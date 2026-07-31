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

  // ✅ CHANGED — was useNotification() (a persisted notification log that
  // nothing populates for admins — only ContactController@reply() ever
  // creates a Notification row, and that one is addressed to the
  // customer, not the admin). useAdminBell() instead aggregates live
  // pending counts straight from the same endpoints AdminDashboard uses
  // (payments, deliveries, reservations, contacts), so it's always
  // accurate without needing any new backend notification triggers.
  const { items, totalCount, loading, refresh } = useAdminBell();

  // ✅ NEW — the mail icon's badge reuses the "contacts" item already
  // computed by useAdminBell, instead of firing a second network request
  // for the same number.
  const unreadMailCount = items.find(i => i.id === 'contacts')?.count ?? 0;

  // ✅ NEW — refresh the bell instantly when any order/contact broadcast
  // event fires, instead of waiting up to 30s for the next poll. Placed
  // here (not just in AdminDashboard) so it works across every admin page,
  // since AdminHeader renders on all of them via AdminLayout.
  useEcho(null, { onAnyChange: refresh });

  const getInitials = (name) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  // Close dropdown when clicking outside of it
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
    <header className="sticky top-0 z-50 bg-white shadow-sm border-b border-gray-100 px-6 py-4 flex justify-between items-center">
      <div className="flex items-center gap-4">
        <button onClick={toggleSidebar} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <LuMenu size={20} className="text-gray-600" />
        </button>
        <h1 className="text-xl font-bold text-[#1e292b]">{title}</h1>
      </div>

      <div className="flex-1 max-w-sm mx-6">
        <div className="relative flex items-center">
          <LuSearch className="absolute left-3 text-gray-400" size={16} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={placeholder}
            className="w-full pl-10 pr-12 py-2 bg-gray-50 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#9ff3a9]"
          />

          {searchTerm ? (
            <button
              onClick={() => setSearchTerm('')}
              type="button"
              className="absolute right-3 p-1 rounded-full hover:bg-gray-200 transition-colors"
              title="Clear search"
            >
              <LuX size={14} className="text-gray-500" />
            </button>
          ) : (
            <span className="absolute right-3 text-[10px] bg-gray-200 px-1.5 py-0.5 rounded text-gray-500 font-bold">⌘ F</span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Mail — quick link to Contacts, badge shows unread count */}
        <button
          onClick={() => navigate('/admin/contacts')}
          className="relative p-2 hover:bg-gray-100 rounded-full transition-colors"
          title="Contact Messages"
        >
          <LuMail size={20} className="text-gray-600" />
          {unreadMailCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center bg-red-500 text-white text-[10px] font-black rounded-full">
              {unreadMailCount > 9 ? '9+' : unreadMailCount}
            </span>
          )}
        </button>

        {/* Bell — aggregated action-items dropdown (payments, deliveries, reservations, contacts) */}
        <div className="relative" ref={bellRef}>
          <button
            onClick={() => setBellOpen(prev => !prev)}
            className="relative p-2 hover:bg-gray-100 rounded-full transition-colors"
            title="Action Items"
          >
            <LuBell size={20} className="text-gray-600" />
            {totalCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center bg-red-500 text-white text-[10px] font-black rounded-full">
                {totalCount > 9 ? '9+' : totalCount}
              </span>
            )}
          </button>

          {bellOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl border border-gray-100 shadow-xl overflow-hidden z-50">
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-50">
                <p className="text-sm font-black text-[#1e292b]">Action Items</p>
                <button
                  onClick={refresh}
                  className="text-[11px] font-bold text-gray-400 hover:text-[#2D4A22] transition-colors"
                >
                  Refresh
                </button>
              </div>

              {/* List */}
              <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
                {loading ? (
                  <div className="p-8 text-center text-xs text-gray-400 font-bold uppercase tracking-widest animate-pulse">
                    Loading...
                  </div>
                ) : items.length === 0 ? (
                  <div className="p-8 text-center space-y-2">
                    <LuCircleCheckBig size={24} className="text-green-300 mx-auto" />
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">All caught up!</p>
                  </div>
                ) : (
                  items.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleItemClick(item)}
                      className={`px-4 py-3 cursor-pointer hover:bg-gray-50/70 transition-colors flex gap-2.5 ${item.bg}`}
                    >
                      <div className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${item.dot}`} />
                      <div className="min-w-0 flex-1">
                        <p className={`text-xs font-black truncate ${item.color}`}>
                          {item.title}
                        </p>
                        <p className="text-[11px] text-gray-500 truncate">{item.sub}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 border-l pl-4">
          <div className="text-right">
            <p className="text-xs font-bold text-gray-800">{userName}</p>
            <p className="text-[10px] text-gray-500 capitalize">{userRole}</p>
          </div>

          {userRole.toLowerCase() === 'admin' ? (
            <img
              className="w-9 h-9 rounded-full object-cover border"
              src={ch1}
              alt="Profile"
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-orange-500 flex items-center justify-center text-white text-xs font-bold border">
              {getInitials(userName)}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;