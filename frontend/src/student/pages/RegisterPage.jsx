import React, { useState } from 'react';
import api from '../services/api';
import { useNavigate, Link } from 'react-router-dom';

const RegisterPage = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await api.post('/auth/register', { username, email, password });
            navigate('/login');
        } catch (err) {
            setError(err.response?.data?.detail || 'Registration failed. Please Check your input.');
        } finally {
            setLoading(false);
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
                        <img src="/src/assets/logo.png" alt="ExamGuard Logo" className="w-48 h-48 object-contain mb-6 drop-shadow-2xl" />
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
                                <h3 className="font-semibold text-lg">Calibrate Biometrics</h3>
                                <p className="text-blue-200 text-sm">Establish your unique baseline.</p>
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
                                        className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors"
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
                                        className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors"
                                        placeholder="name@example.com"
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                                <div className="mt-1">
                                    <input
                                        id="password"
                                        name="password"
                                        type="password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors"
                                        placeholder="Create a strong password"
                                    />
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
                                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Creating Account...' : 'Create Account'}
                            </button>
                        </div>
                    </form>

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
