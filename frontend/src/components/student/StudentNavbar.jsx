import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, LogOut, LayoutDashboard, BookOpen, User } from 'lucide-react';

/**
 * StudentNavbar — Shared responsive navbar for the student portal.
 *
 * Props:
 *  - username:    Display name (string)
 *  - onLogout:    Callback for sign-out
 *  - avatarLabel: Single character(s) shown inside the avatar circle (defaults to first letter of username)
 *  - avatarStyle: Optional className overrides for the avatar circle
 */
const StudentNavbar = ({ username, onLogout, avatarLabel, avatarStyle }) => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    const navItems = [
        { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/courses', label: 'Learning Hub', icon: BookOpen },
        { path: '/profile', label: 'Profile', icon: User },
    ];

    const isActive = (path) => location.pathname === path;
    const initials = avatarLabel || username?.charAt(0).toUpperCase() || '?';

    return (
        <>
            <nav className="bg-white/80 backdrop-blur-xl border-b border-gray-200/60 shadow-sm sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        {/* Left: Logo + Desktop Nav Links */}
                        <div className="flex items-center gap-4 md:gap-6">
                            {/* Mobile hamburger */}
                            <button
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                className="md:hidden p-3 -ml-3 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
                                aria-label="Toggle menu"
                            >
                                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                            </button>

                            {/* Brand */}
                            <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/dashboard')}>
                                <img src="/logo.png" alt="ExamGuard Logo" className="w-10 h-10 md:w-12 md:h-12 object-contain" />
                                <span className="font-bold text-lg md:text-xl tracking-tight text-gray-800">
                                    ExamGuard <span className="text-blue-600">Global</span>
                                </span>
                            </div>

                            {/* Desktop nav links */}
                            <div className="hidden md:flex gap-1 border-l pl-6 border-gray-200/60 h-8 items-center">
                                {navItems.map((item) => (
                                    <button
                                        key={item.path}
                                        onClick={() => navigate(item.path)}
                                        className={`px-3 py-1.5 text-sm font-medium transition-all rounded-lg ${
                                            isActive(item.path)
                                                ? 'text-blue-600 bg-blue-50 font-semibold'
                                                : 'text-gray-500 hover:text-blue-600 hover:bg-blue-50'
                                        }`}
                                    >
                                        {item.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Right: User info + Avatar + Logout */}
                        <div className="flex items-center gap-3">
                            <div className="hidden md:flex flex-col items-end mr-1">
                                <span className="text-sm font-semibold text-gray-700">{username}</span>
                                <span className="text-[11px] text-gray-400 font-medium">Student</span>
                            </div>
                            <div
                                onClick={() => navigate('/profile')}
                                className={`h-10 w-10 rounded-full flex items-center justify-center font-bold text-sm border-2 border-white shadow-sm cursor-pointer hover:shadow-md hover:scale-105 transition-all ${
                                    avatarStyle || 'bg-blue-600 text-white'
                                }`}
                                title="View Profile"
                            >
                                {initials}
                            </div>
                            <button
                                onClick={onLogout}
                                className="hidden sm:block ml-1 px-3 py-1.5 text-xs text-gray-400 hover:text-red-500 font-medium transition-colors rounded-lg hover:bg-red-50"
                            >
                                Sign Out
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Mobile slide-down menu */}
            {mobileMenuOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className="md:hidden fixed inset-0 bg-black/30 z-40"
                        onClick={() => setMobileMenuOpen(false)}
                    />

                    {/* Menu panel */}
                    <div className="md:hidden fixed top-16 left-0 right-0 bg-white border-b border-gray-200 shadow-lg z-50 animate-fadeIn">
                        <div className="px-4 py-3 space-y-1">
                            {navItems.map((item) => {
                                const Icon = item.icon;
                                return (
                                    <button
                                        key={item.path}
                                        onClick={() => {
                                            navigate(item.path);
                                            setMobileMenuOpen(false);
                                        }}
                                        className={`w-full flex items-center gap-3 px-4 py-4 rounded-xl text-base font-medium transition-colors ${
                                            isActive(item.path)
                                                ? 'bg-blue-50 text-blue-700'
                                                : 'text-gray-700 hover:bg-gray-50'
                                        }`}
                                    >
                                        <Icon className={`w-5 h-5 ${isActive(item.path) ? 'text-blue-600' : 'text-gray-400'}`} />
                                        {item.label}
                                    </button>
                                );
                            })}

                            {/* Mobile-only user info + logout */}
                            <div className="border-t border-gray-100 pt-3 mt-2">
                                <div className="flex items-center gap-3 px-3 py-2">
                                    <div className={`h-9 w-9 rounded-full flex items-center justify-center font-bold text-xs ${avatarStyle || 'bg-blue-600 text-white'}`}>
                                        {initials}
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">{username}</p>
                                        <p className="text-xs text-gray-500">Student Account</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => {
                                        onLogout();
                                        setMobileMenuOpen(false);
                                    }}
                                    className="w-full flex items-center gap-3 px-4 py-4 rounded-xl text-base font-medium text-red-600 hover:bg-red-50 transition-colors"
                                >
                                    <LogOut className="w-5 h-5" />
                                    Sign Out
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </>
    );
};

export default StudentNavbar;
