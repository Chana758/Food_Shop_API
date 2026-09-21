import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LuLayoutDashboard, LuBox, LuClipboardList,
  LuUsers, LuLayers, LuSettings, LuLogOut, LuCreditCard,
  LuUserCheck, LuDatabase, LuTrash2, LuTable2, LuShoppingCart,
  LuTrendingUp, LuHeart, LuBike, LuCalendarDays, LuMail, LuStar,
} from 'react-icons/lu';
import { useAuth } from '../../../context/AuthContext';


const FONT_SERIF = { fontFamily: "'Fraunces', Georgia, serif" };

const BrandSeal = ({ size = 44 }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <circle cx="32" cy="32" r="30" stroke="#D99A3D" strokeOpacity="0.3" strokeWidth="1" />
    <circle cx="32" cy="32" r="27" fill="#161F22" stroke="#D99A3D" strokeWidth="2" />

    <g fill="#D99A3D">
      <ellipse cx="14" cy="44" rx="3" ry="5.5" opacity="0.65" transform="rotate(-55 14 44)" />
      <ellipse cx="11" cy="37" rx="3" ry="5.5" opacity="0.75" transform="rotate(-30 11 37)" />
      <ellipse cx="9.5" cy="29" rx="3" ry="5.5" opacity="0.85" transform="rotate(-5 9.5 29)" />
      <ellipse cx="11" cy="21" rx="3" ry="5.5" opacity="0.95" transform="rotate(20 11 21)" />
      <ellipse cx="50" cy="44" rx="3" ry="5.5" opacity="0.65" transform="rotate(55 50 44)" />
      <ellipse cx="53" cy="37" rx="3" ry="5.5" opacity="0.75" transform="rotate(30 53 37)" />
      <ellipse cx="54.5" cy="29" rx="3" ry="5.5" opacity="0.85" transform="rotate(5 54.5 29)" />
      <ellipse cx="53" cy="21" rx="3" ry="5.5" opacity="0.95" transform="rotate(-20 53 21)" />
    </g>

    <path d="M32 8 L33.2 11.2 L36.6 11.4 L34 13.6 L34.9 17 L32 15 L29.1 17 L30 13.6 L27.4 11.4 L30.8 11.2 Z" fill="#D99A3D" />

    <g transform="translate(10,10)">
      <path d="M21 32 C21 32 21 24 18 19 C15 14 10 12 10 12 C10 12 10 20 14 25 C17 29 21 32 21 32Z" fill="#F4E3B8" />
      <path d="M23 32 C23 32 23 24 26 19 C29 14 34 12 34 12 C34 12 34 20 30 25 C27 29 23 32 23 32Z" fill="#F4E3B8" />
      <line x1="22" y1="32" x2="22" y2="27" stroke="#161F22" strokeWidth="2" strokeLinecap="round" />
    </g>
  </svg>
);

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

const SECTION_TONE = {
  'Overview':          { bg: 'bg-[#332B1E]', ic: 'text-[#D9A94D]' },
  'Operations':        { bg: 'bg-[#33251C]', ic: 'text-[#E0895A]' },
  'Engagement':        { bg: 'bg-[#1E2A38]', ic: 'text-[#7BA7E0]' },
  'Catalog':           { bg: 'bg-[#2A2438]', ic: 'text-[#B08AE0]' },
  'People & reports':  { bg: 'bg-[#1E332A]', ic: 'text-[#6FBF8C]' },
  'System':            { bg: 'bg-[#332222]', ic: 'text-[#D97878]' },
};

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
      { name: 'Settings', icon: <LuSettings />, path: '/admin/settings', roles: ['admin',] },
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
     
      style={{ background: 'var(--sidebar-bg)' }}
      className={`h-screen text-[#A9B2B0] flex flex-col fixed left-0 top-0 z-50
        border-r border-[#32444A] transition-colors duration-300
        ${collapsed ? 'w-20' : 'w-72'}`}
    >
      {/* Brand */}
      <div
        className={`flex flex-col items-center border-b border-[#32444A] gap-2.5
          ${collapsed ? 'py-5 px-0' : 'py-7 px-6'}`}
      >
        <BrandSeal size={collapsed ? 40 : 56} />
        {!collapsed && (
          <div className="flex flex-col items-center gap-1.5 min-w-0">
            <h1 style={FONT_SERIF} className="text-[#FBF9F5] font-semibold text-[19px] leading-tight tracking-tight truncate">
              Khmer-Fresh
            </h1>
            <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#D99A3D]">
              Authentic Taste
            </p>
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
                  const tone = SECTION_TONE[section.label];
                  return (
                    <Link
                      key={item.name}
                      to={item.path}
                      title={collapsed ? item.name : undefined}
                      className={`group relative flex items-center gap-3 py-2 rounded-lg transition-colors duration-150
                        ${collapsed ? 'px-0 justify-center' : 'px-2'}
                        ${isActive
                          ? 'bg-[#28383D] text-[#F0CE83]'
                          : 'text-[#9AA5A3] hover:text-[#FBF9F5] hover:bg-[#243338]'}`}
                    >
                      {isActive && !collapsed && (
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-4 rounded-r bg-[#D99A3D]" />
                      )}
                      <span
                        className={`w-8 h-8 flex items-center justify-center text-[17px] flex-shrink-0 transition-all duration-150
                          ${isActive ? 'text-[#D99A3D]' : `${tone.ic} group-hover:brightness-125`}`}
                      >
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