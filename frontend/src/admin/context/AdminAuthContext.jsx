import { createContext, useContext, useState, useEffect } from 'react';
import { adminAuth } from '../services/adminApi';

const AdminAuthContext = createContext(null);

export const useAdminAuth = () => {
    const context = useContext(AdminAuthContext);
    if (!context) {
        throw new Error('useAdminAuth must be used within AdminAuthProvider');
    }
    return context;
};

export const AdminAuthProvider = ({ children }) => {
    const [admin, setAdmin] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        const token = localStorage.getItem('adminToken');
        if (token) {
            try {
                const response = await adminAuth.getMe();
                setAdmin(response.data);
            } catch (error) {
                localStorage.removeItem('adminToken');
                setAdmin(null);
            }
        }
        setLoading(false);
    };

    const login = async (credentials) => {
        const response = await adminAuth.login(credentials);
        const { access_token, admin: adminData } = response.data;
        localStorage.setItem('adminToken', access_token);
        setAdmin(adminData);
        return adminData;
    };

    const logout = async () => {
        try {
            await adminAuth.logout();
        } catch (error) {
            console.error('Logout error:', error);
        }
        localStorage.removeItem('adminToken');
        setAdmin(null);
    };

    return (
        <AdminAuthContext.Provider value={{ admin, loading, login, logout }}>
            {children}
        </AdminAuthContext.Provider>
    );
};
