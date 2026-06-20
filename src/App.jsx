import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';

// --- AOS Animation ---
import AOS from "aos";
import "aos/dist/aos.css";

// --- 1. Layout Components ---
import Navbar from './components/layout/user/Navbar';
import Footer from './components/layout/user/Footer';
import AdminLayout from './components/layout/admin/AdminLayout'; 

// --- 2. Pages: User ---
import Home from './pages/user/Home';
import About from './pages/user/About';
import Contact from './pages/user/Contact';
import Cart from './pages/user/Cart';
import Checkout from './pages/user/Checkout';
import Favorites from './pages/user/Favorites';
import OrderSuccess from './pages/user/OrderSuccess';
import OrderHistory from './pages/user/OrderHistory';
import Reservation from './pages/user/Reservation';
import SearchResults from "./pages/user/menu/SearchResults";
import Service from './pages/user/Service';

// --- 3. Pages: Auth ---
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// --- 4. Pages: Admin ---
import AdminRoute from './components/guards/AdminRoute';
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageOrders from './pages/admin/ManageOrders';     
import ManageProducts from './pages/admin/ManageProducts'; 
import StaffManagement from './pages/admin/StaffManagement'; 
import CustomersManagement from './pages/admin/CustomersManagement';
import ManageCategories from './pages/admin/ManagementCategories';
import ManageTables from './pages/admin/ManageTables';
import ManagementSaler from './pages/admin/ManagementSaler';
import ManageSettings from './pages/admin/ManageSettings.jsx';
import ManagePayments from './pages/admin/PaymentManagement.jsx';
// New Admin Pages
import Backup from './pages/admin/Backup.jsx';
import Trash from './pages/admin/Trash.jsx';
import Report from './pages/admin/Report.jsx';

// --- 5. Pages: Menu ---
import AllMenu from './pages/user/menu/AllMenu'; 
import MenuCategoryDetail from './pages/user/menu/MenuCategoryDetail'; 
import ProductDetail from './pages/user/menu/ProductDetail'; 
import Category from './pages/user/menu/Category'; 

// --- 6. Utils ---
import { initDummyUsers } from './utils/initDummyData';
import PaymentManagement from './pages/admin/PaymentManagement.jsx';

// Component to scroll to top on route change
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};
 
const App = () => {
  useEffect(() => {
    initDummyUsers();
    AOS.init({
      duration: 900,
      offset: 80,
      once: true,
    });
  }, []);

  return (
    <Router>
      <ScrollToTop />
      <Routes>
        {/* ==========================================
            SECTION 1: USER & PUBLIC
            ========================================== */}
        <Route path="/" element={<><Navbar /><Home /><Footer /></>} />
        <Route path="/home" element={<><Navbar /><Home /><Footer /></>} />
        <Route path="/about" element={<><Navbar /><About /><Footer /></>} />
        <Route path="/contact" element={<><Navbar /><Contact /><Footer /></>} />
        <Route path="/reservation" element={<><Navbar /><Reservation /><Footer /></>} />
        <Route path="/service" element={<><Navbar /><Service /><Footer /></>} />
        <Route path="/search" element={<><Navbar /><SearchResults /><Footer /></>} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Dynamic Menu Routes */}
        <Route path="/menu" element={<><Navbar /><AllMenu /><Footer /></>} />
        <Route path="/menu/:slug" element={<><Navbar /><MenuCategoryDetail /><Footer /></>} />
        <Route path="/menu/product/:id" element={<><Navbar /><ProductDetail /><Footer /></>} />
        <Route path="/menu/category/all" element={<><Navbar /><Category /><Footer /></>} />

        {/* Shopping & Orders */}
        <Route path="/favorites" element={<><Navbar /><Favorites /><Footer /></>} />
        <Route path="/cart" element={<><Navbar /><Cart /><Footer /></>} />
        <Route path="/checkout" element={<><Navbar /><Checkout /><Footer /></>} />
        <Route path="/order-success" element={<><Navbar /><OrderSuccess /><Footer /></>} />
        <Route path="/order-history" element={<><Navbar /><OrderHistory /><Footer /></>} />

        {/* ==========================================
            SECTION 2: ADMIN ROUTES (Protected & Sidebar)
            ========================================== */}
        <Route path="/admin" element={
          <AdminRoute>
            <AdminLayout /> 
          </AdminRoute>
        }>
            <Route index element={<Navigate to="dashboard" replace />} /> 
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="orders" element={<ManageOrders />} />
            <Route path="products" element={<ManageProducts />} />
            <Route path="staff" element={<StaffManagement />} />
            <Route path="customers" element={<CustomersManagement />} />
            <Route path="categories" element={<ManageCategories />} />
            <Route path="settings" element={<ManageSettings />} />
            <Route path="tables" element={<ManageTables />} /> 
            <Route path="pos" element={<ManagementSaler />} />
            <Route path='payments' element={<PaymentManagement/>}/>
            {/* Added Backup and Trash routes */}
            <Route path="backup" element={<Backup />} />
            <Route path="trash" element={<Trash />} />
            <Route path='reports' element={<Report/>}/>
        </Route>

        {/* Redirect unknown routes to Home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default App;