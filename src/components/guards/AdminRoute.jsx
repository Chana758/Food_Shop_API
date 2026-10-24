import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const AdminRoute = ({ children }) => {
    const { user, loading } = useAuth();

    // Wait for AuthContext to sync from localStorage first (prevents flash redirect on refresh)
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="flex flex-col items-center gap-3">
                    <svg className="animate-spin h-8 w-8 text-[#2D4A22]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <p className="text-sm text-gray-500 font-medium">Loading...</p>
                </div>
            </div>
        );
    }

    // Not logged in or role is not admin/staff → Go to login
    if (!user || (user.role !== 'admin' && user.role !== 'staff')) {
        return <Navigate to="/login" replace />;
    }

    return children;
};

export default AdminRoute;