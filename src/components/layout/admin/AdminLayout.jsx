import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';

// កំណត់ Title របស់ Header ទៅតាម path នីមួយៗ — បន្ថែម route ថ្មីនៅទីនេះ
const PAGE_TITLES = {
  '/admin': 'Dashboard Overview',
  '/admin/dashboard': 'Dashboard Overview',
  '/admin/sales': 'Sale Management',
  '/admin/products': 'Product Management',
  '/admin/orders': 'Order Management',
  '/admin/customers': 'Customer Management',
  '/admin/reports': 'Reports',
  '/admin/settings': 'Settings',
};

const AdminLayout = () => {
  // State គ្រប់គ្រង Sidebar collapse — share រវាង Sidebar និង Content wrapper
  const [collapsed, setCollapsed] = useState(false);
  // State គ្រប់គ្រង Search — share ឲ្យ Header ប្រើ (persist រវាង page)
  const [searchTerm, setSearchTerm] = useState('');

  const location = useLocation();
  const title = PAGE_TITLES[location.pathname] || 'Admin';

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* ១. Sidebar នៅថេរ (Navigation) */}
      <AdminSidebar collapsed={collapsed} />

      {/* ២. ផ្នែកខាងស្តាំសម្រាប់បង្ហាញ Header + Content */}
      <div
        className={`flex-1 overflow-x-hidden transition-all duration-300 ${
          collapsed ? 'ml-20' : 'ml-72'
        }`}
      >
        <AdminHeader
          title={title}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          toggleSidebar={() => setCollapsed((prev) => !prev)}
        />

        <main>
          {/*
            Outlet នេះគឺសំខាន់បំផុត!
            វាដើរតួដូច @yield('content') ក្នុង Laravel ដើម្បីបង្ហាញ
            AdminDashboard, ManagementSaler ឬ ManageProducts ទៅតាម Route ដែលយើងចុច។
          */}
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;