import { createContext, useContext, useState, useEffect } from 'react';
import { adminAuth } from '../../services/adminApi';

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
                // Only clear token on genuine auth failures (401/403),
                // NOT on network errors (server might be cold-starting)
                if (error.response?.status === 401 || error.response?.status === 403) {
                    localStorage.removeItem('adminToken');
                    setAdmin(null);
                } else {
                    // Network error or 5xx — server might be waking up.
                    // Keep the token, let the retry system handle it.
                    // The user will see the ServerWakingOverlay.
                    console.warn('[AdminAuth] Token check failed (possible cold start), preserving session:', error.message);
                }
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
