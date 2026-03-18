import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';
import { Lock, User, Shield } from 'lucide-react';
import serverStatus from '../../lib/serverStatus';

const logo = '/logo.png';

const Login = () => {
    const [credentials, setCredentials] = useState({ username: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [statusMessage, setStatusMessage] = useState('');
    const { login } = useAdminAuth();
    const navigate = useNavigate();

    // Subscribe to server status for contextual messages
    useEffect(() => {
        const unsubscribe = serverStatus.subscribe(({ isWaking, retryCount }) => {
            if (isWaking && retryCount > 0) {
                setStatusMessage(`Connecting to server… (attempt ${retryCount + 1})`);
            } else if (!isWaking) {
                setStatusMessage('');
            }
        });
        return unsubscribe;
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (loading) return; // prevent double-click
        setError('');
        setStatusMessage('');
        setLoading(true);

        try {
            await login(credentials);
            navigate('/admin/dashboard');
        } catch (err) {
            if (err.response?.status === 401 || err.response?.status === 400) {
                setError('Invalid credentials. Please check your username and password.');
            } else if (!err.response) {
                setError('Unable to reach the server. Please try again in a moment.');
            } else {
                setError(err.response?.data?.detail || 'Login failed. Please try again.');
            }
        } finally {
            setLoading(false);
            setStatusMessage('');
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCredentials(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="min-h-screen flex bg-gray-50 font-sans">
            {/* Left Side - Image/Brand */}
            <div className="hidden lg:flex lg:w-1/2 relative bg-blue-900 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-900 to-slate-900 opacity-90 z-10"></div>
                <img
                    src="https://images.unsplash.com/photo-1497215728101-856f4ea42174?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1950&q=80"
                    alt="Corporate Office"
                    className="absolute inset-0 w-full h-full object-cover mix-blend-overlay"
                />
                <div className="relative z-20 flex flex-col justify-center px-12 text-white">
                    <div className="flex flex-col items-center mb-10 text-center">
                        <img src={logo} alt="ExamGuard Logo" className="w-48 h-48 object-contain mb-6 drop-shadow-2xl" />
                        <h1 className="text-6xl font-extrabold tracking-tight">ExamGuard</h1>
                    </div>
                    <p className="text-xl text-blue-100 max-w-lg leading-relaxed text-center mx-auto">
                        Secure Administration Portal. Manage assessments, monitor integrity, and oversee candidate performance with advanced analytics.
                    </p>
                    <div className="mt-12 flex justify-center gap-8">
                        <div className="flex flex-col items-center gap-2">
                            <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-sm shadow-lg">
                                <Shield className="w-8 h-8 text-blue-300" />
                            </div>
                            <div className="text-center">
                                <p className="font-semibold text-lg">Admin Access</p>
                                <p className="text-sm text-blue-200">Restricted Area</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-16">
                <div className="w-full max-w-md space-y-8">
                    <div className="text-center lg:text-left">
                        <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Admin Portal</h2>
                        <p className="mt-2 text-gray-500">Sign in to access administrative controls.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                        {error && (
                            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
                                <div className="flex">
                                    <div className="flex-shrink-0">
                                        <Shield className="h-5 w-5 text-red-400" />
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-sm text-red-700">{error}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Server status message (retry feedback) */}
                        {statusMessage && !error && (
                            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-md">
                                <div className="flex items-center">
                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent mr-3"></div>
                                    <p className="text-sm text-blue-700">{statusMessage}</p>
                                </div>
                            </div>
                        )}

                        <div className="space-y-5">
                            <div>
                                <label htmlFor="username" className="block text-sm font-medium text-gray-700">Username</label>
                                <div className="mt-1 relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <User className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        id="username"
                                        name="username"
                                        type="text"
                                        required
                                        value={credentials.username}
                                        onChange={handleInputChange}
                                        disabled={loading}
                                        className="appearance-none block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors disabled:bg-gray-100"
                                        placeholder="Enter admin username"
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                                <div className="mt-1 relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        id="password"
                                        name="password"
                                        type="password"
                                        required
                                        value={credentials.password}
                                        onChange={handleInputChange}
                                        disabled={loading}
                                        className="appearance-none block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors disabled:bg-gray-100"
                                        placeholder="Enter secure password"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-700 hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading && (
                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                                )}
                                {loading ? 'Authenticating...' : 'Sign In'}
                            </button>
                        </div>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-600">
                            Don't have an account?{' '}
                            <Link to="/admin/register" className="font-medium text-blue-600 hover:text-blue-500 transition-colors">
                                Create one
                            </Link>
                        </p>
                    </div>

                    <div className="mt-10 border-t border-gray-200 pt-6">
                        <p className="text-xs text-center text-gray-400">
                            © 2026 ExamGuard Global. All rights reserved. <br />Crafted by <span className="font-medium text-gray-500">Om Chandrakant Deo</span>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
