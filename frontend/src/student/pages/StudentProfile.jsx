import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const StudentProfile = () => {
    const { username, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
            {/* Navigation Bar */}
            <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/dashboard')}>
                                <img src="/src/assets/logo.png" alt="ExamGuard Logo" className="w-12 h-12 object-contain hidden md:block" />
                                <span className="font-bold text-xl tracking-tight text-gray-800">ExamGuard <span className="text-blue-600">Global</span></span>
                            </div>
                            <div className="hidden md:flex gap-6 border-l pl-6 border-gray-200 h-8 items-center">
                                <button onClick={() => navigate('/dashboard')} className="text-gray-500 hover:text-blue-600 font-medium transition-colors">Dashboard</button>
                                <button onClick={() => navigate('/courses')} className="text-gray-500 hover:text-blue-600 font-medium transition-colors">Learning Hub</button>
                                <button onClick={() => navigate('/profile')} className="text-blue-600 font-bold transition-colors">Profile</button>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="hidden md:flex flex-col items-end mr-2">
                                <span className="text-sm font-semibold text-gray-700">{username}</span>
                                <span className="text-xs text-gray-500">Candidate ID: 8492-2024</span>
                            </div>
                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold border border-blue-200">
                                {username?.charAt(0).toUpperCase()}
                            </div>
                            <button
                                onClick={handleLogout}
                                className="ml-2 text-sm text-gray-500 hover:text-red-600 transition-colors"
                            >
                                Sign Out
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-4xl mx-auto px-4 py-8">
                <h1 className="text-2xl font-bold text-gray-800 mb-6">Candidate Profile</h1>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="bg-blue-600 h-32 relative"></div>
                    <div className="px-8 pb-8">
                        <div className="-mt-16 flex justify-between items-end mb-6">
                            <div className="h-32 w-32 rounded-full border-4 border-white bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-5xl shadow-sm">
                                {username?.charAt(0).toUpperCase()}
                            </div>
                            <button className="px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors border border-gray-300">
                                Edit Profile
                            </button>
                        </div>

                        <div>
                            <h2 className="text-3xl font-bold text-gray-900">{username}</h2>
                            <p className="text-gray-500 text-lg">Candidate ID: EXAM-8492-2024</p>

                            <div className="flex gap-3 mt-4">
                                <span className="px-3 py-1 bg-green-100 text-green-700 font-medium text-sm rounded-full">Proctor Verified</span>
                                <span className="px-3 py-1 bg-blue-100 text-blue-700 font-medium text-sm rounded-full">Active Student</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10 border-t border-gray-100 pt-8">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">Personal Information</h3>
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-sm text-gray-500 font-medium">Full Name</p>
                                        <p className="text-gray-900">{username}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 font-medium">Email Address</p>
                                        <p className="text-gray-900">{username.toLowerCase()}@student.examguard.ai</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 font-medium">Institution</p>
                                        <p className="text-gray-900">ExamGuard University</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 font-medium">Enrollment Date</p>
                                        <p className="text-gray-900">January 15, 2024</p>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">Security Preferences</h3>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                                        <div>
                                            <p className="font-medium text-gray-900">Face Authentication</p>
                                            <p className="text-xs text-gray-500">Required for high-stakes exams</p>
                                        </div>
                                        <div className="w-10 h-6 bg-blue-600 rounded-full flex items-center px-1">
                                            <div className="w-4 h-4 bg-white rounded-full translate-x-4"></div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                                        <div>
                                            <p className="font-medium text-gray-900">Two-Factor Auth</p>
                                            <p className="text-xs text-gray-500">Secure your account</p>
                                        </div>
                                        <div className="w-10 h-6 bg-blue-600 rounded-full flex items-center px-1">
                                            <div className="w-4 h-4 bg-white rounded-full translate-x-4"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default StudentProfile;
