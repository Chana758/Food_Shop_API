import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';
import { useSettings } from '../../../context/SettingsContext';
import { useAuth } from '../../../context/AuthContext';

const PAGE_META = {
  '/admin':              { title: 'Dashboard Overview',   placeholder: 'Search menu...' },
  '/admin/dashboard':    { title: 'Dashboard Overview',   placeholder: 'Search menu...' },
  '/admin/pos':          { title: 'POS / Sale',           placeholder: 'Search products...' },
  '/admin/sales':        { title: 'Sale Management',      placeholder: 'Search menu...' },
  '/admin/orders':       { title: 'Order Management',     placeholder: 'Search orders...' },
  '/admin/delivery':     { title: 'Delivery Management',  placeholder: 'Search deliveries...' },
  '/admin/payments':     { title: 'Payment Management',   placeholder: 'Search payments...' },
  '/admin/favorites':    { title: 'Favorites',            placeholder: 'Search by customer or product...' },
  '/admin/staff':        { title: 'Staff Management',     placeholder: 'Search staff...' },
  '/admin/customers':    { title: 'Customer Management',  placeholder: 'Search customers...' },
  '/admin/products':     { title: 'Product Management',   placeholder: 'Search products...' },
  '/admin/categories':   { title: 'Category Management',  placeholder: 'Search categories...' },
  '/admin/tables':       { title: 'Table Management',     placeholder: 'Search tables...' },
  '/admin/reservations': { title: 'Reservations',         placeholder: 'Search by customer or table...' },
  '/admin/contacts':     { title: 'Contact Messages',     placeholder: 'Search by name, email, subject...' },
  '/admin/reviews':      { title: 'Review Management',    placeholder: 'Search by customer, product, comment...' },
  '/admin/reports':      { title: 'Reports',              placeholder: 'Search menu...' },
  '/admin/backup':       { title: 'Backup',               placeholder: 'Search menu...' },
  '/admin/trash':        { title: 'Trash',                placeholder: 'Search menu...' },
  '/admin/settings':     { title: 'Settings',             placeholder: 'Search menu...' },
};

const ACTIVITY_EVENTS = ['mousedown', 'keydown', 'scroll', 'touchstart'];

const AdminLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const location = useLocation();
  const navigate = useNavigate();
  const meta = PAGE_META[location.pathname] ?? { title: 'Admin', placeholder: 'Search menu...' };

  const { settings } = useSettings();
  const { logout }   = useAuth();

  const idleTimerRef = useRef(null);

  useEffect(() => {
    setSearchTerm('');
  }, [location.pathname]);

  const resetIdleTimer = useCallback(() => {
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);

    if (settings.auto_logout === false) return;

    const minutes = parseInt(settings.logout_time, 10) || 30;
    idleTimerRef.current = setTimeout(() => {
      logout();
      navigate('/login');
    }, minutes * 60 * 1000);
  }, [settings.auto_logout, settings.logout_time, logout, navigate]);

  useEffect(() => {
    resetIdleTimer();

    ACTIVITY_EVENTS.forEach(evt => window.addEventListener(evt, resetIdleTimer));

    return () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      ACTIVITY_EVENTS.forEach(evt => window.removeEventListener(evt, resetIdleTimer));
    };
  }, [resetIdleTimer]);

  return (
    //  CHANGED — was `bg-slate-100 dark:bg-[#0F1A1D]`. This is the
    // outermost page canvas visible behind every route, so it now reads
    // the same --page-bg variable every content page uses. Whichever
    // Appearance > "Apply Accent Color To" option is active decides
    // whether this stays neutral or picks up the customer's color.
    <div style={{ background: 'var(--page-bg)' }} className="flex h-screen overflow-hidden transition-colors duration-300">
      <AdminSidebar collapsed={collapsed} />

      <div
        className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${
          collapsed ? 'ml-20' : 'ml-72'
        }`}
      >
        <AdminHeader
          title={meta.title}
          placeholder={meta.placeholder}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          toggleSidebar={() => setCollapsed(prev => !prev)}
        />

        <main className="flex-1 overflow-y-auto">
          <Outlet context={{ searchTerm, setSearchTerm }} />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;