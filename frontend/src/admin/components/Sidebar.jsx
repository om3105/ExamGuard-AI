import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';
import { LayoutDashboard, FileText, Users, BarChart3, LogOut, Menu, X, UserPlus, BookOpen, Activity, ClipboardCheck, TrendingUp } from 'lucide-react';
import { useState } from 'react';
import logo from '../assets/logo.png'; // Import the logo

const Sidebar = () => {
    const { admin, logout } = useAdminAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const menuItems = [
        { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/admin/exams', label: 'Exam Management', icon: FileText },
        { path: '/admin/courses', label: 'Courses', icon: BookOpen },
        { path: '/admin/enrollments', label: 'Enrollments', icon: ClipboardCheck },
        { path: '/admin/students', label: 'Students', icon: Users },
        { path: '/admin/monitoring', label: 'Live Radar', icon: Activity },
        { path: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
        { path: '/admin/progress', label: 'Student Progress', icon: TrendingUp },
        { path: '/admin/register', label: 'Create Admin', icon: UserPlus },
    ];

    const handleLogout = async () => {
        await logout();
        navigate('/admin/login');
    };

    const isActive = (path) => location.pathname === path;

    return (
        <>
            {/* Mobile menu toggle */}
            <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md"
            >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            {/* Sidebar */}
            <div className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
      `}>
                {/* Branding - Matching User Dashboard Navbar Style */}
                <div className="h-16 flex items-center gap-3 px-6 border-b border-gray-200">
                    <img src={logo} alt="ExamGuard Logo" className="w-8 h-8 object-contain" />
                    <span className="font-bold text-lg tracking-tight text-gray-800">ExamGuard <span className="text-blue-600">Admin</span></span>
                </div>

                <nav className="mt-6 px-3 space-y-1">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const active = isActive(item.path);
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                onClick={() => setMobileMenuOpen(false)}
                                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                  ${active
                                        ? 'bg-blue-50 text-blue-700'
                                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                                    }
                `}
                            >
                                <Icon className={`w-5 h-5 ${active ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-500'}`} />
                                <span>{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="absolute bottom-0 w-full border-t border-gray-200 bg-gray-50">
                    <div className="p-4">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="h-9 w-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                                {admin?.username?.charAt(0).toUpperCase()}
                            </div>
                            <div className="overflow-hidden">
                                <p className="text-sm font-medium text-gray-900 truncate">{admin?.full_name}</p>
                                <p className="text-xs text-gray-500 truncate">{admin?.email}</p>
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 text-sm text-gray-600 hover:text-red-600 transition-colors w-full px-1"
                        >
                            <LogOut className="w-4 h-4" />
                            <span>Sign Out</span>
                        </button>
                    </div>
                    <div className="px-4 py-2.5 border-t border-gray-200 bg-gray-100/50">
                        <p className="text-[10px] text-gray-400 text-center leading-relaxed">
                            © 2026 ExamGuard Global · Crafted by <span className="text-gray-500">Om Chandrakant Deo</span>
                        </p>
                    </div>
                </div>
            </div>

            {/* Overlay for mobile */}
            {mobileMenuOpen && (
                <div
                    onClick={() => setMobileMenuOpen(false)}
                    className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
                />
            )}
        </>
    );
};

export default Sidebar;
