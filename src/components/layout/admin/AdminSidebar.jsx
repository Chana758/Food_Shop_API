import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LuLayoutDashboard, LuBox, LuClipboardList,
  LuUsers, LuLayers, LuSettings, LuLogOut, LuCreditCard,
  LuUserCheck, LuDatabase, LuTrash2, LuTable2, LuShoppingCart,
  LuTrendingUp, LuHeart, LuBike, LuCalendarDays, LuMail, LuStar,
} from 'react-icons/lu';
import { useAuth } from '../../../context/AuthContext';

/*
  DESIGN TOKENS — matches AdminDashboard's Khmer-Fresh palette
  ----------------------------------------------------------------
  Ink (sidebar bg)      #1E2A2E   Ink-raised (hover/active)  #28383D
  Paper (contrast text) #FBF9F5   Ink-soft (muted label)     #7C8A8D
  Line (dividers)       #32444A   Gold (active accent)       #D99A3D
  Chili (logout hover)  #B5453B

  Display face is 'Fraunces' for the brand wordmark only, matching the
  dashboard's page titles. Falls back to Georgia if not loaded:
  <link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600&display=swap" rel="stylesheet">
*/
const FONT_SERIF = { fontFamily: "'Fraunces', Georgia, serif" };

// Same krama motif used on the dashboard header — ties the two surfaces
// together as one visual identity instead of two unrelated color systems.
const KramaAccent = ({ className = '' }) => (
  <svg width="40" height="5" viewBox="0 0 40 5" className={className} aria-hidden="true">
    {Array.from({ length: 5 }).map((_, i) => (
      <rect
        key={i}
        x={i * 8}
        width="8"
        height="5"
        fill={i % 2 === 0 ? '#D99A3D' : '#3C4E53'}
        opacity={i === 4 ? 0.4 : 1}
      />
    ))}
  </svg>
);

// Grouped sections instead of one flat 16-item list — each label tells you
// what kind of work lives underneath it, so scanning the nav is faster.
const NAV_SECTIONS = [
  {
    label: 'Overview',
    items: [
      { name: 'Dashboard', icon: <LuLayoutDashboard />, path: '/admin/dashboard', roles: ['admin', 'staff'] },
      { name: 'Favorites', icon: <LuHeart />,            path: '/admin/favorites', roles: ['admin', 'staff'] },
    ],
  },
  {
    label: 'Operations',
    items: [
      { name: 'POS / Sale',    icon: <LuShoppingCart />,  path: '/admin/pos',          roles: ['admin', 'staff'] },
      { name: 'Orders',        icon: <LuClipboardList />, path: '/admin/orders',       roles: ['admin', 'staff'] },
      { name: 'Delivery',      icon: <LuBike />,          path: '/admin/delivery',     roles: ['admin'] },
      { name: 'Reservations',  icon: <LuCalendarDays />,  path: '/admin/reservations', roles: ['admin', 'staff'] },
      { name: 'Tables',        icon: <LuTable2 />,        path: '/admin/tables',       roles: ['admin'] },
    ],
  },
  {
    label: 'Engagement',
    items: [
      { name: 'Contacts', icon: <LuMail />,       path: '/admin/contacts', roles: ['admin', 'staff'] },
      { name: 'Reviews',  icon: <LuStar />,        path: '/admin/reviews',  roles: ['admin', 'staff'] },
      { name: 'Payments', icon: <LuCreditCard />,  path: '/admin/payments', roles: ['admin', 'staff'] },
    ],
  },
  {
    label: 'Catalog',
    items: [
      { name: 'Products',   icon: <LuBox />,    path: '/admin/products',   roles: ['admin'] },
      { name: 'Categories', icon: <LuLayers />, path: '/admin/categories', roles: ['admin'] },
    ],
  },
  {
    label: 'People & reports',
    items: [
      { name: 'Staff',     icon: <LuUserCheck />, path: '/admin/staff',     roles: ['admin'] },
      { name: 'Customers', icon: <LuUsers />,     path: '/admin/customers', roles: ['admin'] },
      { name: 'Reports',   icon: <LuTrendingUp />, path: '/admin/reports',  roles: ['admin'] },
    ],
  },
  {
    label: 'System',
    items: [
      { name: 'Backup',   icon: <LuDatabase />, path: '/admin/backup',   roles: ['admin'] },
      { name: 'Trash',    icon: <LuTrash2 />,   path: '/admin/trash',    roles: ['admin'] },
      { name: 'Settings', icon: <LuSettings />, path: '/admin/settings', roles: ['admin'] },
    ],
  },
];

const AdminSidebar = ({ collapsed }) => {
  const location  = useLocation();
  const { user, logout } = useAuth();
  const userRole  = user?.role?.toLowerCase() || 'staff';

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  return (
    <div
      className={`h-screen bg-[#1E2A2E] text-[#A9B2B0] flex flex-col fixed left-0 top-0 z-50
        border-r border-[#32444A] transition-all duration-300
        ${collapsed ? 'w-20' : 'w-72'}`}
    >
      {/* Brand */}
      <div
        className={`flex items-center border-b border-[#32444A] gap-3
          ${collapsed ? 'py-5 px-0 justify-center' : 'p-6'}`}
      >
        <div className="flex-shrink-0">
          <svg width="40" height="40" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="44" height="44" rx="9" fill="#28383D" />
            <path d="M21 32 C21 32 21 24 18 19 C15 14 10 12 10 12 C10 12 10 20 14 25 C17 29 21 32 21 32Z" fill="#F4E3B8" />
            <path d="M23 32 C23 32 23 24 26 19 C29 14 34 12 34 12 C34 12 34 20 30 25 C27 29 23 32 23 32Z" fill="#F4E3B8" />
            <line x1="22" y1="32" x2="22" y2="27" stroke="#28383D" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
        {!collapsed && (
          <div className="flex flex-col gap-1.5 min-w-0">
            <h1 style={FONT_SERIF} className="text-[#FBF9F5] font-semibold text-[19px] leading-tight tracking-tight truncate">
              Khmer-Fresh
            </h1>
            <KramaAccent />
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className={`flex-1 overflow-y-auto py-4 ${collapsed ? 'px-3' : 'px-4'}`}>
        {NAV_SECTIONS.map(section => {
          const visibleItems = section.items.filter(item => item.roles.includes(userRole));
          if (visibleItems.length === 0) return null;
          return (
            <div key={section.label} className="mb-5 last:mb-1">
              {!collapsed && (
                <p className="px-3 mb-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-[#65757A]">
                  {section.label}
                </p>
              )}
              <div className="space-y-0.5">
                {visibleItems.map(item => {
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.name}
                      to={item.path}
                      title={collapsed ? item.name : undefined}
                      className={`relative flex items-center gap-3 py-2.5 rounded-lg transition-colors duration-150
                        ${collapsed ? 'px-0 justify-center' : 'px-3'}
                        ${isActive
                          ? 'bg-[#28383D] text-[#F0CE83]'
                          : 'text-[#9AA5A3] hover:text-[#FBF9F5] hover:bg-[#243338]'}`}
                    >
                      {isActive && !collapsed && (
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-4 rounded-r bg-[#D99A3D]" />
                      )}
                      <span className={`text-[17px] flex-shrink-0 ${isActive ? 'text-[#D99A3D]' : 'text-[#7C8A8D]'}`}>
                        {item.icon}
                      </span>
                      {!collapsed && (
                        <span className={`text-[13.5px] ${isActive ? 'font-semibold' : 'font-medium'}`}>
                          {item.name}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      {/* Logout */}
      <div className={`border-t border-[#32444A] ${collapsed ? 'p-3' : 'p-4'}`}>
        <button
          onClick={handleLogout}
          title={collapsed ? 'Logout' : undefined}
          className={`flex items-center w-full rounded-lg text-[#9AA5A3]
            hover:bg-[#3A2422] hover:text-[#E39187] transition-colors group
            ${collapsed ? 'justify-center py-2.5 px-0' : 'gap-3 px-3 py-2.5'}`}
        >
          <LuLogOut size={17} className="group-hover:-translate-x-0.5 transition-transform" />
          {!collapsed && <span className="text-[13.5px] font-medium">Logout</span>}
        </button>
      </div>
    </div>
  );
};

export default AdminSidebar;