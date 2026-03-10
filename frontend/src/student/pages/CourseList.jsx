import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getCourses, requestEnrollment } from '../services/api';
import { BookOpen, Search, PlayCircle, LogOut, Clock, XCircle } from 'lucide-react';

const CourseList = () => {
    const { username, logout } = useAuth();
    const navigate = useNavigate();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [requesting, setRequesting] = useState(null);

    const fetchCourses = async () => {
        try {
            const data = await getCourses();
            setCourses(data);
        } catch (error) {
            console.error("Failed to fetch courses:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchCourses(); }, []);

    const handleRequestEnrollment = async (courseId) => {
        setRequesting(courseId);
        try {
            await requestEnrollment(courseId);
            // Refresh to show updated status
            await fetchCourses();
        } catch (error) {
            const msg = error.response?.data?.detail || "Failed to request enrollment";
            alert(msg);
        }
        setRequesting(null);
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const filteredCourses = courses.filter(c => c.title.toLowerCase().includes(searchTerm.toLowerCase()));

    const renderCourseButton = (course) => {
        const cid = course._id || course.id;
        const status = course.enrollment_status;

        if (status === 'APPROVED') {
            return (
                <button
                    onClick={() => navigate(`/courses/${cid}`)}
                    className="w-full py-3 bg-indigo-50 text-indigo-700 font-bold rounded-xl hover:bg-indigo-100 hover:text-indigo-800 transition-colors flex items-center justify-center gap-2"
                >
                    <PlayCircle className="w-5 h-5" /> Resume Course
                </button>
            );
        }

        if (status === 'PENDING') {
            return (
                <div className="w-full py-3 bg-amber-50 text-amber-700 font-semibold rounded-xl text-center flex items-center justify-center gap-2 border border-amber-200">
                    <Clock className="w-4 h-4" /> Enrollment Pending Approval
                </div>
            );
        }

        if (status === 'REJECTED') {
            return (
                <div className="space-y-2">
                    <div className="w-full py-2 bg-red-50 text-red-600 font-medium rounded-xl text-center flex items-center justify-center gap-2 border border-red-200 text-sm">
                        <XCircle className="w-4 h-4" /> Enrollment Request Rejected
                    </div>
                    <button
                        onClick={() => handleRequestEnrollment(cid)}
                        disabled={requesting === cid}
                        className="w-full py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-50"
                    >
                        {requesting === cid ? 'Requesting...' : 'Re-request Enrollment'}
                    </button>
                </div>
            );
        }

        // Not enrolled yet
        return (
            <button
                onClick={() => handleRequestEnrollment(cid)}
                disabled={requesting === cid}
                className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center shadow-md shadow-blue-600/20 hover:shadow-lg hover:shadow-blue-600/30 disabled:opacity-50"
            >
                {requesting === cid ? 'Requesting...' : 'Request Enrollment'}
            </button>
        );
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
                                <button onClick={() => navigate('/courses')} className="text-blue-600 font-bold transition-colors">Learning Hub</button>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="hidden md:flex flex-col items-end mr-2">
                                <span className="text-sm font-semibold text-gray-700">{username}</span>
                                <span className="text-xs text-gray-500">Student Profile</span>
                            </div>
                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold border border-blue-200">
                                {username?.charAt(0).toUpperCase()}
                            </div>
                            <button onClick={handleLogout} className="ml-2 text-sm text-gray-500 hover:text-red-600 transition-colors">
                                <LogOut className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Hero Section */}
                <div className="mb-8 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-8 text-white shadow-lg flex flex-col md:flex-row items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">Explore the Learning Hub</h1>
                        <p className="text-blue-100 max-w-lg mb-6">Enhance your skills with our expert-led modules before taking your final certification exams.</p>
                        <div className="relative max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search courses..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 rounded-full text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-sm"
                            />
                        </div>
                    </div>
                    <BookOpen className="w-32 h-32 text-white/20 hidden md:block mr-8" />
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                ) : filteredCourses.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
                        <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-gray-900">No courses found</h3>
                        <p className="text-gray-500 mt-1">Try adjusting your search query.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredCourses.map(course => {
                            const cid = course._id || course.id;
                            return (
                                <div key={cid} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 group flex flex-col">
                                    <div className="h-40 bg-gray-200 relative overflow-hidden">
                                        {course.thumbnail_url ? (
                                            <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                        ) : (
                                            <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 p-6 flex items-end">
                                                <h3 className="text-xl font-bold text-white shadow-sm">{course.title}</h3>
                                            </div>
                                        )}
                                        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-indigo-700 shadow-sm flex items-center gap-1">
                                            <PlayCircle className="w-3 h-3" />
                                            {course.modules?.reduce((acc, m) => acc + (m.lessons?.length || 0), 0) || 0} Lessons
                                        </div>
                                        {/* Enrollment status badge */}
                                        {course.enrollment_status && (
                                            <div className={`absolute top-4 left-4 px-2 py-0.5 rounded-full text-xs font-semibold ${course.enrollment_status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                                                course.enrollment_status === 'PENDING' ? 'bg-amber-100 text-amber-700' :
                                                    'bg-red-100 text-red-700'
                                                }`}>
                                                {course.enrollment_status === 'APPROVED' ? '✓ Enrolled' :
                                                    course.enrollment_status === 'PENDING' ? '⏳ Pending' : '✗ Rejected'}
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-6 flex flex-col flex-1">
                                        <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2">{course.title}</h3>
                                        <p className="text-sm text-gray-500 mb-6 line-clamp-3 flex-1">{course.description}</p>
                                        {renderCourseButton(course)}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>

            <footer className="border-t border-gray-200 bg-white/60 backdrop-blur-sm mt-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
                    <p className="text-[11px] text-gray-400 tracking-wide">© 2026 ExamGuard Global. All rights reserved.</p>
                    <p className="text-[11px] text-gray-400 tracking-wide">Crafted by <span className="font-medium text-gray-500">Om Chandrakant Deo</span></p>
                </div>
            </footer>
        </div>
    );
};

export default CourseList;
