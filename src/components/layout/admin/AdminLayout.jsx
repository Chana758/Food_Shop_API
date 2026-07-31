
import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';

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

const AdminLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const location = useLocation();
  const meta = PAGE_META[location.pathname] ?? { title: 'Admin', placeholder: 'Search menu...' };

  // Clear search term ពេលប្ដូរទៅទំព័រផ្សេង
  useEffect(() => {
    setSearchTerm('');
  }, [location.pathname]);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-100">
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
          {/* បញ្ជូនទាំង searchTerm និង setSearchTerm ទៅឱ្យ Outlet ដើម្បីឱ្យ ManageOrders និង Favorites អាចយកទៅប្រើបាន */}
          <Outlet context={{ searchTerm, setSearchTerm }} />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;