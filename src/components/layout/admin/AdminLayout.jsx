import React, { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';
import { useSettings } from '../../../context/SettingsContext';
import { useAuth } from '../../../context/AuthContext';
import { useTranslation } from 'react-i18next';

const PageLoader = () => (
  <div className="flex items-center justify-center py-32">
    <span className="h-8 w-8 rounded-full border-4 border-[#2D4A22]/20 border-t-[#F58220] animate-spin" />
  </div>
);

// Values are translation keys (translated below with t())
const PAGE_META = {
  '/admin':                { title: 'admin.page.dashboard', placeholder: 'admin.search.menu' },
  '/admin/dashboard':      { title: 'admin.page.dashboard', placeholder: 'admin.search.menu' },
  '/admin/pos':            { title: 'admin.page.pos', placeholder: 'admin.search.products' },
  '/admin/sales':          { title: 'admin.page.sales', placeholder: 'admin.search.menu' },
  '/admin/orders':         { title: 'admin.page.orders', placeholder: 'admin.search.orders' },
  '/admin/delivery':       { title: 'admin.page.delivery', placeholder: 'admin.search.deliveries' },
  '/admin/payments':       { title: 'admin.page.payments', placeholder: 'admin.search.payments' },
  '/admin/favorites':      { title: 'admin.page.favorites', placeholder: 'admin.search.favorites' },
  '/admin/staff':          { title: 'admin.page.staff', placeholder: 'admin.search.staff' },
  '/admin/customers':      { title: 'admin.page.customers', placeholder: 'admin.search.customers' },
  '/admin/products':       { title: 'admin.page.products', placeholder: 'admin.search.products' },
  '/admin/categories':     { title: 'admin.page.categories', placeholder: 'admin.search.categories' },
  '/admin/tables':         { title: 'admin.page.tables', placeholder: 'admin.search.tables' },
  '/admin/reservations':   { title: 'admin.page.reservations', placeholder: 'admin.search.reservations' },
  '/admin/contacts':       { title: 'admin.page.contacts', placeholder: 'admin.search.contacts' },
  '/admin/reviews':        { title: 'admin.page.reviews', placeholder: 'admin.search.reviews' },
  '/admin/reports':        { title: 'admin.page.reports', placeholder: 'admin.search.menu' },
  '/admin/backup':         { title: 'admin.page.backup', placeholder: 'admin.search.menu' },
  '/admin/trash':          { title: 'admin.page.trash', placeholder: 'admin.search.menu' },
  '/admin/settings':       { title: 'admin.page.settings', placeholder: 'admin.search.menu' },
};

const ACTIVITY_EVENTS = ['mousedown', 'keydown', 'scroll', 'touchstart'];

const AdminLayout = () => {
  const { t } = useTranslation();
  const [collapsed, setCollapsed] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const location = useLocation();
  const navigate = useNavigate();
  const meta = PAGE_META[location.pathname] ?? { title: 'admin.page.admin', placeholder: 'admin.search.menu' };

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

    <div style={{ background: 'var(--page-bg)' }} className="flex h-screen overflow-hidden transition-colors duration-300">
      <AdminSidebar collapsed={collapsed} />

      <div
        className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${
          collapsed ? 'ml-20' : 'ml-72'
        }`}
      >
        <AdminHeader
          title={t(meta.title)}
          placeholder={t(meta.placeholder)}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          toggleSidebar={() => setCollapsed(prev => !prev)}
        />

        <main className="flex-1 overflow-y-auto">
          {/* Admin pages are lazy-loaded (App.jsx); show a spinner while one downloads */}
          <Suspense fallback={<PageLoader />}>
            <Outlet context={{ searchTerm, setSearchTerm }} />
          </Suspense>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;