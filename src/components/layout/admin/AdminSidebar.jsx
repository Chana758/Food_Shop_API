import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LuLayoutDashboard, LuBox, LuClipboardList,
  LuUsers, LuLayers, LuSettings, LuLogOut, LuCreditCard,
  LuUserCheck, LuDatabase, LuTrash2, LuTable2, LuShoppingCart,
  LuTrendingUp
} from 'react-icons/lu';

const AdminSidebar = ({ collapsed }) => {
  const location = useLocation();

  // Retrieve user role from local storage to handle access control
  const userRole = localStorage.getItem('user_role') || 'staff';

  const menuItems = [
    // --- Group 1: General Functions for Staff and Admin ---
    { name: 'Dashboard', icon: <LuLayoutDashboard />, path: '/admin/dashboard', roles: ['admin', 'staff'] },
    { name: 'POS / Sale', icon: <LuShoppingCart />, path: '/admin/pos', roles: ['admin', 'staff'] },
    { name: 'Orders', icon: <LuClipboardList />, path: '/admin/orders', roles: ['admin', 'staff'] },
    { name: 'Payments', icon: <LuCreditCard />, path: '/admin/payments', roles: ['admin', 'staff'] },

    // --- Group 2: Admin-only Functions ---
    { name: 'Staff', icon: <LuUserCheck />, path: '/admin/staff', roles: ['admin'] },
    { name: 'Customers', icon: <LuUsers />, path: '/admin/customers', roles: ['admin'] },
    { name: 'Products', icon: <LuBox />, path: '/admin/products', roles: ['admin'] },
    { name: 'Categories', icon: <LuLayers />, path: '/admin/categories', roles: ['admin'] },

    // --- Group 3: System Data Management ---
    { name: 'Reports', icon: <LuTrendingUp />, path: '/admin/reports', roles: ['admin'] },
    { name: 'Backup', icon: <LuDatabase />, path: '/admin/backup', roles: ['admin'] },
    { name: 'Trash', icon: <LuTrash2 />, path: '/admin/trash', roles: ['admin'] },
    { name: 'Tables', icon: <LuTable2 />, path: '/admin/tables', roles: ['admin'] },

    // --- Group 4: System Settings ---
    { name: 'Settings', icon: <LuSettings />, path: '/admin/settings', roles: ['admin'] },
  ];

  return (
    <div
      className={`h-screen bg-[#1c2e35] text-gray-300 flex flex-col fixed left-0 top-0 z-50 shadow-xl border-r border-white/5 transition-all duration-300 ${
        collapsed ? 'w-20' : 'w-72'
      }`}
    >

      {/* Logo Section */}
      <div className={`mb-4 flex items-center border-b border-b-green-800 gap-3 ${collapsed ? 'p-5 justify-center' : 'p-7'}`}>
        <div className="flex-shrink-0">
          <svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="44" height="44" rx="9" fill="#2a3f32"/>
            <path d="M21 32 C21 32 21 24 18 19 C15 14 10 12 10 12 C10 12 10 20 14 25 C17 29 21 32 21 32Z" fill="white"/>
            <path d="M23 32 C23 32 23 24 26 19 C29 14 34 12 34 12 C34 12 34 20 30 25 C27 29 23 32 23 32Z" fill="white"/>
            <line x1="22" y1="32" x2="22" y2="27" stroke="#2a3f32" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </div>
        {!collapsed && (
          <div className="flex flex-col ">
            <h1 className="text-white font-bold text-[22px] leading-tight tracking-tight">Khmer-Fresh</h1>
            <p className="text-[11px] text-[#4ade80] font-medium leading-tight">Authentic Traditional Food</p>
          </div>
        )}
      </div>

      {/* Navigation Links */}
      <nav className={`flex-1 space-y-2 mt-2 overflow-y-auto ${collapsed ? 'px-3' : 'px-5'}`}>
        {menuItems
          .filter((item) => item.roles.includes(userRole.toLowerCase()))
          .map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                title={collapsed ? item.name : undefined}
                className={`flex items-center gap-4 py-3 rounded-xl transition-all duration-200 border-2 ${
                  collapsed ? 'px-0 justify-center' : 'px-5'
                } ${
                  isActive
                    ? 'border-[#4ade80]/40 bg-[#2a3c3f] text-[#ffcc33] shadow-lg shadow-black/20'
                    : 'border-transparent text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <span className={`text-xl ${isActive ? 'text-[#ffcc33]' : 'text-gray-400'}`}>{item.icon}</span>
                {!collapsed && (
                  <span className={`text-[15px] ${isActive ? 'font-bold' : 'font-medium'}`}>{item.name}</span>
                )}
              </Link>
            );
          })}
      </nav>

      {/* Logout Action */}
      <div className={`border-t border-white/5 ${collapsed ? 'p-3' : 'p-6'}`}>
        <button
          onClick={() => {
            localStorage.clear();
            window.location.href = '/login';
          }}
          title={collapsed ? 'Logout' : undefined}
          className={`flex items-center w-full border border-gray-100/50 rounded-xl text-white hover:text-white hover:bg-red-500/10 hover:border-red-500/50 transition-all group ${
            collapsed ? 'justify-center py-3 px-0' : 'gap-3 px-6 py-3'
          }`}
        >
          <LuLogOut size={20} className="group-hover:-translate-x-1 transition-transform"/>
          {!collapsed && <span className="text-[15px] font-semibold">Logout</span>}
        </button>
      </div>
    </div>
  );
};

export default AdminSidebar;