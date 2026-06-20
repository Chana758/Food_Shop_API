// src/components/guards/AdminRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';

const AdminRoute = ({ children }) => {
    const token = localStorage.getItem('token'); 
    const role = localStorage.getItem('user_role');

    // 🔑 កែសម្រួលលក្ខខណ្ឌ៖ បើគ្មាន Token ឬ Role មិនមែនជា admin ផង និងមិនមែនជា staff ផង ទើបដេញចេញ
    if (!token || (role !== 'admin' && role !== 'staff')) {
        return <Navigate to="/login" replace />;
    }

    return children;
};

export default AdminRoute;