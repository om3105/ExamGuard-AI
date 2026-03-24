import React, { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../../services/api';

const EyeIcon = ({ visible, onClick }) => (
    <button type="button" onClick={onClick} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors">
        {visible ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
            </svg>
        ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
        )}
    </button>
);

const ResetPasswordPage = () => {
    const [searchParams] = useSearchParams();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
    const token = searchParams.get('token');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (loading) return;
        setError('');

        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }
        if (password.length < 8) {
            setError('Password must be at least 8 characters long.');
            return;
        }

        setLoading(true);
        try {
            await api.post('/auth/reset-password', { token, new_password: password });
            setSuccess(true);
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to reset password. The link may be expired.');
        } finally {
            setLoading(false);
        }
    };

    if (!token) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
                <div className="max-w-md w-full bg-white rounded-2xl shadow-lg border border-gray-100 p-8 text-center">
                    <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-50 flex items-center justify-center">
                        <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Invalid Link</h2>
                    <p className="text-gray-500 mb-6">No reset token found. Please request a new password reset.</p>
                    <Link to="/forgot-password" className="inline-flex items-center justify-center w-full py-3 px-4 bg-blue-700 text-white rounded-lg font-medium hover:bg-blue-800 transition-colors">
                        Request New Link
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="max-w-md w-full">
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
                    {!success ? (
                        <>
                            <div className="text-center mb-8">
                                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-50 flex items-center justify-center">
                                    <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900">Set New Password</h2>
                                <p className="text-gray-500 mt-2 text-sm">Choose a strong password for your account.</p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-5">
                                {error && (
                                    <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded-md">
                                        <p className="text-sm text-red-700">{error}</p>
                                    </div>
                                )}

                                <div>
                                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                                    <div className="relative">
                                        <input
                                            id="password"
                                            type={showPassword ? 'text' : 'password'}
                                            required
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="block w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                                            placeholder="Must be at least 8 characters"
                                        />
                                        <EyeIcon visible={showPassword} onClick={() => setShowPassword(!showPassword)} />
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                                    <div className="relative">
                                        <input
                                            id="confirmPassword"
                                            type={showConfirm ? 'text' : 'password'}
                                            required
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className="block w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                                            placeholder="Re-enter your new password"
                                        />
                                        <EyeIcon visible={showConfirm} onClick={() => setShowConfirm(!showConfirm)} />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full flex justify-center items-center py-3 px-4 bg-blue-700 text-white rounded-lg font-medium hover:bg-blue-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                                >
                                    {loading && <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>}
                                    {loading ? 'Resetting...' : 'Reset Password'}
                                </button>
                            </form>
                        </>
                    ) : (
                        <div className="text-center">
                            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-green-50 flex items-center justify-center">
                                <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h2 className="text-xl font-bold text-gray-900 mb-2">Password Reset Successful!</h2>
                            <p className="text-gray-500 mb-6 text-sm">Your password has been updated. You can now sign in with your new password.</p>
                            <Link
                                to="/login"
                                className="inline-flex items-center justify-center w-full py-3 px-4 bg-blue-700 text-white rounded-lg font-medium hover:bg-blue-800 transition-colors text-sm"
                            >
                                Continue to Sign In
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ResetPasswordPage;
