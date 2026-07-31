import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true); // ✅ ការពារ AdminRoute redirect មុនពេល check ចប់

    useEffect(() => {
        // ✅ sync state ពី sessionStorage ពេល app mount (refresh page)
        //    sessionStorage ដាច់ដោយឡែកក្នុង tab នីមួយៗ — ដូចគ្នានឹង axios.js / authService.js
        try {
            const savedUser  = sessionStorage.getItem('user');
            const savedToken = sessionStorage.getItem('access_token');
            if (savedUser && savedToken) {
                setUser(JSON.parse(savedUser));
            }
        } catch {
            // sessionStorage corrupt → ignore
        } finally {
            setLoading(false); // ✅ ចប់ check → AdminRoute អាច render បាន
        }
    }, []);

    //  login() — called from Login.jsx after API success
    const login = (userData, accessToken) => {
        // persist to sessionStorage (ដាច់ដោយឡែកក្នុង tab នីមួយៗ)
        sessionStorage.setItem('access_token', accessToken);
        sessionStorage.setItem('user',        JSON.stringify(userData));
        sessionStorage.setItem('currentUser', JSON.stringify(userData)); // legacy Navbar key
        // sync React state
        setUser(userData);
    };

    //  logout() — clears everything
    const logout = () => {
        sessionStorage.removeItem('access_token');
        sessionStorage.removeItem('user');
        sessionStorage.removeItem('currentUser');
        // legacy key cleanup (ករណីមាន residual data ពី version ចាស់)
        sessionStorage.removeItem('user_role');
        sessionStorage.removeItem('user_name');
        sessionStorage.removeItem('token');
        localStorage.removeItem('user_role'); // សម្អាត localStorage residual ផងដែរ
        localStorage.removeItem('token');
        localStorage.removeItem('currentUser');
        setUser(null);
    };

    const updateStatus = (newStatus) => {
        if (!user) return;
        const updated = { ...user, status: newStatus };
        setUser(updated);
        sessionStorage.setItem('user',        JSON.stringify(updated));
        sessionStorage.setItem('currentUser', JSON.stringify(updated));
    };

    const isAuthenticated = !!user;
    const role       = user?.role?.toLowerCase() || '';
    const isAdmin    = role === 'admin';
    const isStaff    = role === 'staff';
    const isCustomer = role === 'customer';

    return (
        <AuthContext.Provider value={{
            user, loading,
            isAuthenticated, role,
            isAdmin, isStaff, isCustomer,
            login, logout, updateStatus,
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);