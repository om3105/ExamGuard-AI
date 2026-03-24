import React, { useState } from 'react';
import api from '../../services/api';
import { useNavigate, Link } from 'react-router-dom';


const EyeIcon = ({ visible, onClick }) => (
    <button type="button" onClick={onClick} tabIndex={-1} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors">
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

const GoogleIcon = () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
);

const RegisterPage = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [registered, setRegistered] = useState(false);
    const [registeredEmail, setRegisteredEmail] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (loading) return;
        setError('');
        setLoading(true);

        try {
            await api.post('/auth/register', { username, email, password });
            navigate('/login');
        } catch (err) {
            setError((err.response?.data?.message || err.response?.data?.detail) || 'Registration failed. Please check your input.');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignup = async () => {
        try {
            const response = await api.get('/auth/google/login');
            window.location.href = response.data.auth_url;
        } catch (err) {
            setError('Google sign-up is not available at the moment.');
        }
    };

    return (
        <div className="min-h-screen flex bg-gray-50">
            {/* Left Side - Image/Brand */}
            <div className="hidden lg:flex lg:w-1/2 relative bg-blue-900 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-900 to-slate-900 opacity-90 z-10"></div>
                <img
                    src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80"
                    alt="Team Collaboration"
                    className="absolute inset-0 w-full h-full object-cover mix-blend-overlay"
                />
                <div className="relative z-20 flex flex-col justify-center px-12 text-white">
                    <div className="flex flex-col items-center mb-10 text-center">
                        <img src="/logo.png" alt="ExamGuard Logo" className="w-48 h-48 object-contain mb-6 drop-shadow-2xl" />
                        <h1 className="text-6xl font-extrabold tracking-tight">ExamGuard</h1>
                    </div>
                    <p className="text-xl text-blue-100 max-w-lg leading-relaxed text-center mx-auto">
                        Join thousands of professionals who have validated their skills through our secure, unbiased assessment platform.
                    </p>
                    <div className="mt-12 space-y-6 flex flex-col items-center">
                        <div className="flex flex-col items-center text-center gap-2">
                            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shadow-md">
                                <span className="font-bold text-lg">1</span>
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg">Create Profile</h3>
                                <p className="text-blue-200 text-sm">Set up your secure candidate identity.</p>
                            </div>
                        </div>
                        <div className="flex flex-col items-center text-center gap-2">
                            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shadow-md">
                                <span className="font-bold text-lg">2</span>
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg">Verify Email</h3>
                                <p className="text-blue-200 text-sm">Confirm your identity securely.</p>
                            </div>
                        </div>
                        <div className="flex flex-col items-center text-center gap-2">
                            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shadow-md">
                                <span className="font-bold text-lg">3</span>
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg">Take Assessment</h3>
                                <p className="text-blue-200 text-sm">Prove your skills securely.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side - Register Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-16">
                <div className="w-full max-w-md space-y-8">
                    <div className="text-center lg:text-left">
                        <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Candidate Registration</h2>
                        <p className="mt-2 text-gray-500">Create your account to begin the assessment process.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                        {error && (
                            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
                                <div className="flex">
                                    <div className="flex-shrink-0">
                                        <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-sm text-red-700">{error}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="space-y-4">
                            <div>
                                <label htmlFor="username" className="block text-sm font-medium text-gray-700">Username</label>
                                <div className="mt-1">
                                    <input
                                        id="username"
                                        name="username"
                                        type="text"
                                        required
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        disabled={loading}
                                        className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors disabled:bg-gray-100"
                                        placeholder="Choose a unique username"
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
                                <div className="mt-1">
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        disabled={loading}
                                        className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors disabled:bg-gray-100"
                                        placeholder="name@example.com"
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                                <div className="mt-1 relative">
                                    <input
                                        id="password"
                                        name="password"
                                        type={showPassword ? 'text' : 'password'}
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        disabled={loading}
                                        className="appearance-none block w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors disabled:bg-gray-100"
                                        placeholder="Create a strong password"
                                    />
                                    <EyeIcon visible={showPassword} onClick={() => setShowPassword(!showPassword)} />
                                </div>
                                <p className="mt-1 text-xs text-gray-500">
                                    Must be at least 8 characters long.
                                </p>
                            </div>
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading && <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>}
                                {loading ? 'Creating Account...' : 'Create Account'}
                            </button>
                        </div>
                    </form>

                    {/* Divider */}
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-200"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-4 bg-gray-50 text-gray-400">or</span>
                        </div>
                    </div>

                    {/* Google Sign-up */}
                    <button
                        type="button"
                        onClick={handleGoogleSignup}
                        className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                    >
                        <GoogleIcon />
                        Continue with Google
                    </button>

                    <div className="text-center pt-4">
                        <p className="text-sm text-gray-500">
                            Already have an account?{' '}
                            <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
                                Sign In
                            </Link>
                        </p>
                    </div>

                    <div className="mt-10 border-t border-gray-200 pt-6">
                        <p className="text-xs text-center text-gray-400">
                            By registering, you agree to our Terms of Service and Privacy Policy regarding biometric data collection.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
