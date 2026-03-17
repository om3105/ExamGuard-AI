import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [username, setUsername] = useState(localStorage.getItem('username'));

    useEffect(() => {
        if (token) {
            localStorage.setItem('token', token);
        } else {
            localStorage.removeItem('token');
        }
    }, [token]);

    useEffect(() => {
        if (username) {
            localStorage.setItem('username', username);
        } else {
            localStorage.removeItem('username');
        }
    }, [username]);

    const login = (newToken, newUsername) => {
        setToken(newToken);
        setUsername(newUsername);
    };

    const logout = () => {
        setToken(null);
        setUsername(null);
    };

    return (
        <AuthContext.Provider value={{ token, username, login, logout, isAuthenticated: !!token }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
