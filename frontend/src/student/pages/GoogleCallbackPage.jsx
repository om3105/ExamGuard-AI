import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * GoogleCallbackPage — Handles the redirect from Google OAuth.
 * 
 * URL: /auth/google/callback?token=JWT&username=USERNAME
 * 
 * The backend /auth/google/callback redirects here with the JWT token
 * and username in query params. This page extracts them, logs the user in,
 * and redirects to the dashboard.
 */
const GoogleCallbackPage = () => {
    const [searchParams] = useSearchParams();
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const token = searchParams.get('token');
        const username = searchParams.get('username');

        if (token && username) {
            login(token, username);
            navigate('/dashboard', { replace: true });
        } else {
            setError('Google authentication failed. No credentials received.');
        }
    }, [searchParams]);

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
                <div className="max-w-md w-full bg-white rounded-2xl shadow-lg border border-gray-100 p-8 text-center">
                    <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-50 flex items-center justify-center">
                        <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Authentication Failed</h2>
                    <p className="text-gray-500 mb-6">{error}</p>
                    <a href="/login" className="inline-flex items-center justify-center w-full py-3 px-4 bg-blue-700 text-white rounded-lg font-medium hover:bg-blue-800 transition-colors">
                        Back to Sign In
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-500">Completing Google sign-in...</p>
            </div>
        </div>
    );
};

export default GoogleCallbackPage;
