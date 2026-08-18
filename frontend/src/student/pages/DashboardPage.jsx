import React, { useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import StudentNavbar from '../../components/student/StudentNavbar';

const DashboardPage = () => {
    const { username, logout } = useAuth();
    const navigate = useNavigate();

    const [exams, setExams] = React.useState([]);
    const [courses, setCourses] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [activeTab, setActiveTab] = React.useState('assigned'); // 'assigned', 'upcoming', 'completed'

    React.useEffect(() => {
        const fetchData = async () => {
            try {
                const { getExams, getCourses } = await import('../../services/api');
                const [examData, courseData] = await Promise.all([getExams(), getCourses()]);
                setExams(examData);
                setCourses(courseData);
            } catch (error) {
                console.error("Failed to fetch data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Memoize expensive filter operations to avoid recalculating on every render
    const approvedCourses = useMemo(() => courses.filter(c => c.enrollment_status === 'APPROVED'), [courses]);
    const pendingCourses = useMemo(() => courses.filter(c => c.enrollment_status === 'PENDING'), [courses]);
    const now = useMemo(() => new Date(), [exams]);
    const assignedExams = useMemo(() => exams.filter(e => !e.is_blocked && new Date(e.start_time) <= now), [exams, now]);
    const upcomingExams = useMemo(() => exams.filter(e => !e.is_blocked && new Date(e.start_time) > now), [exams, now]);
    const completedExams = useMemo(() => exams.filter(e => e.is_blocked), [exams]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
            {/* Navigation Bar */}
            <StudentNavbar
                username={username}
                onLogout={handleLogout}
                avatarLabel={username?.charAt(0).toUpperCase()}
                avatarStyle="bg-blue-100 text-blue-700 border-blue-200"
            />

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                {/* Welcome Section */}
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-800">Candidate Dashboard</h1>
                    <p className="text-gray-500 mt-1">Manage your assessments and view your performance reports.</p>
                </div>

                {/* Status Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mb-8">
                    {/* Card 1: Learning Progress */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col justify-between">
                        <div className="flex items-start justify-between">
                            <div>
                                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Learning Progress</h3>
                                <p className="text-2xl font-bold text-gray-900 mt-2">
                                    {approvedCourses.length}
                                    <span className="text-sm font-normal text-gray-400 ml-1">
                                        / {courses.length} courses
                                    </span>
                                </p>
                            </div>
                            <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
                                Enrolled
                            </span>
                        </div>
                        <div className="mt-4">
                            <div className="w-full bg-gray-100 rounded-full h-2">
                                <div
                                    className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                                    style={{ width: `${courses.length > 0 ? (approvedCourses.length / courses.length) * 100 : 0}%` }}
                                ></div>
                            </div>
                            <p className="text-xs text-gray-500 mt-2">
                                {pendingCourses.length > 0
                                    ? `${pendingCourses.length} pending approval`
                                    : 'Explore courses in the Learning Hub'}
                            </p>
                        </div>
                    </div>

                    {/* Card 2: Exam Performance */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col justify-between">
                        <div className="flex items-start justify-between">
                            <div>
                                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Exam Performance</h3>
                                <p className="text-2xl font-bold text-gray-900 mt-2">
                                    {completedExams.length}
                                    <span className="text-sm font-normal text-gray-400 ml-1">completed</span>
                                </p>
                            </div>

                            <span className="bg-green-100 text-green-700 text-xs font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                Score
                            </span>
                        </div>
                        <div className="mt-4">
                            <div className="flex items-center gap-3">
                                <div className="flex-1 flex gap-1">
                                    {[...Array(5)].map((_, i) => (
                                        <div key={i} className={`h-6 flex-1 rounded ${i < Math.min(exams.length, 5) ? 'bg-green-400' : 'bg-gray-100'}`}></div>
                                    ))}
                                </div>
                                <span className="text-xs font-medium text-gray-500">{exams.length} assigned</span>
                            </div>
                            <p className="text-xs text-gray-500 mt-2">
                                {assignedExams.length > 0 ? `${assignedExams.length} exam${assignedExams.length > 1 ? 's' : ''} available to attempt` : completedExams.length > 0 ? 'All exams completed!' : 'No exams assigned yet'}
                            </p>
                        </div>
                    </div>

                    {/* Card 3 */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col justify-between">
                        <div className="flex items-start justify-between">
                            <div>
                                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Pending Exams</h3>
                                <p className="text-2xl font-bold text-gray-900 mt-2">{assignedExams.length + upcomingExams.length}</p>
                            </div>
                            <span className="bg-gray-100 text-gray-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">View All</span>
                        </div>
                        <div className="mt-4 text-xs text-gray-500">
                            No assessments scheduled for this week.
                        </div>
                    </div>
                </div>

                {/* My Courses Section */}
                {approvedCourses.length > 0 && (
                    <section className="mb-8 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                            <h2 className="font-bold text-gray-800 flex items-center gap-2">
                                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
                                My Courses — Continue Learning
                            </h2>
                            <button onClick={() => navigate('/courses')} className="text-sm text-blue-600 hover:text-blue-800 font-medium">View All →</button>
                        </div>
                        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {approvedCourses.slice(0, 3).map(course => {
                                const cid = course._id || course.id;
                                const totalLessons = course.modules?.reduce((a, m) => a + (m.lessons?.length || 0), 0) || 0;
                                return (
                                    <div key={cid} className="border border-gray-100 rounded-xl p-4 hover:shadow-md transition cursor-pointer group"
                                        onClick={() => navigate(`/courses/${cid}`)}>
                                        <div className="h-24 bg-blue-600 rounded-lg mb-3 flex items-end p-3">
                                            <h3 className="text-white font-bold text-sm line-clamp-2">{course.title}</h3>
                                        </div>
                                        <p className="text-xs text-gray-500 mb-2 line-clamp-2">{course.description}</p>
                                        <div className="flex items-center gap-2 text-xs text-gray-400">
                                            <span>{totalLessons} lessons</span>
                                            <span>•</span>
                                            <span>{course.modules?.length || 0} modules</span>
                                        </div>
                                        <button className="mt-3 w-full py-2 bg-blue-50 text-blue-700 text-sm font-semibold rounded-lg group-hover:bg-blue-100 transition">
                                            Continue Learning →
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </section>
                )}
                {pendingCourses.length > 0 && (
                    <section className="mb-8 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 bg-amber-50/50 flex items-center gap-2">
                            <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                            <h2 className="font-bold text-gray-800">Pending Enrollment Requests</h2>
                        </div>
                        <div className="p-4 space-y-2">
                            {pendingCourses.map(course => (
                                <div key={course._id || course.id} className="flex items-center justify-between px-4 py-3 border border-amber-100 rounded-lg bg-amber-50/30">
                                    <span className="font-medium text-gray-800 text-sm">{course.title}</span>
                                    <span className="text-xs font-semibold text-amber-700 bg-amber-100 px-2.5 py-1 rounded-full">⏳ Pending Approval</span>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Action Area / Empty State */}
                <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="px-4 sm:px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                        <div className="flex gap-2 sm:gap-6 overflow-x-auto">
                            <button
                                onClick={() => setActiveTab('assigned')}
                                className={`font-semibold pb-4 -mb-4 border-b-2 transition-colors whitespace-nowrap text-sm sm:text-base ${activeTab === 'assigned' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                            >
                                Available Now
                            </button>
                            <button
                                onClick={() => setActiveTab('upcoming')}
                                className={`font-semibold pb-4 -mb-4 border-b-2 transition-colors whitespace-nowrap text-sm sm:text-base ${activeTab === 'upcoming' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                            >
                                Upcoming
                            </button>
                            <button
                                onClick={() => setActiveTab('completed')}
                                className={`font-semibold pb-4 -mb-4 border-b-2 transition-colors whitespace-nowrap text-sm sm:text-base ${activeTab === 'completed' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                            >
                                Completed
                            </button>
                        </div>
                        <button onClick={() => window.location.reload()} className="text-sm text-blue-600 hover:text-blue-800 font-medium self-end sm:self-auto">Refresh List</button>
                    </div>

                    {loading ? (
                        <div className="p-12 flex flex-col items-center justify-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                            <p className="mt-4 text-gray-500">Loading assessments...</p>
                        </div>
                    ) : exams.length === 0 ? (
                        <div className="p-12 flex flex-col items-center justify-center text-center">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>
                            </div>
                            <h3 className="text-lg font-medium text-gray-900">No Exams Assigned</h3>
                            <p className="text-gray-500 max-w-sm mt-2">
                                You currently have no pending assessments. Check back later.
                            </p>
                        </div>
                    ) : (
                        (() => {
                            let displayExams = [];
                            if (activeTab === 'assigned') displayExams = assignedExams;
                            if (activeTab === 'upcoming') displayExams = upcomingExams;
                            if (activeTab === 'completed') displayExams = completedExams;

                            if (displayExams.length === 0) {
                                return (
                                    <div className="p-12 flex flex-col items-center justify-center text-center">
                                        <p className="text-gray-500 max-w-sm">No exams found in this category.</p>
                                    </div>
                                );
                            }

                            return (
                                <div className="divide-y divide-gray-100">
                                    {displayExams.map((exam) => (
                                        <div key={exam._id} className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 hover:bg-gray-50 transition-colors">
                                            <div className="flex items-start gap-3 sm:gap-4 min-w-0">
                                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold flex-shrink-0 ${activeTab === 'completed' ? 'bg-green-100 text-green-600' :
                                                    activeTab === 'upcoming' ? 'bg-amber-100 text-amber-600' :
                                                        'bg-blue-100 text-blue-600'
                                                    }`}>
                                                    {exam.title.charAt(0)}
                                                </div>
                                                <div className="min-w-0">
                                                    <h3 className="font-semibold text-gray-900 truncate">{exam.title}</h3>
                                                    <p className="text-sm text-gray-500 mt-1 line-clamp-1">{exam.description}</p>
                                                    <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-2 text-xs text-gray-400">
                                                        <span className="flex items-center gap-1">
                                                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                                                            {new Date(activeTab === 'completed' && exam.submitted_at ? exam.submitted_at : exam.start_time).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })}
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                                            {exam.duration_minutes} Mins
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                                            {exam.total_marks} Marks
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-stretch sm:items-end gap-1.5 flex-shrink-0 sm:ml-4">
                                                <button
                                                    onClick={() => navigate(`/exam/${exam._id}/waiting-room`)}
                                                    disabled={exam.is_blocked}
                                                    className={`px-5 py-2.5 sm:py-2 text-white text-sm font-medium rounded-lg shadow-sm transition-colors w-full sm:w-auto ${exam.is_blocked
                                                        ? 'bg-gray-400 cursor-not-allowed'
                                                        : activeTab === 'upcoming'
                                                            ? 'bg-blue-600 hover:bg-blue-700'
                                                            : 'bg-green-600 hover:bg-green-700'
                                                        }`}
                                                >
                                                    {exam.is_blocked ? 'Completed' : activeTab === 'upcoming' ? 'Waiting Room' : 'Start Exam'}
                                                </button>
                                                {exam.max_attempts > 0 && (
                                                    <span className="text-xs text-gray-500 font-medium whitespace-nowrap text-center sm:text-right">
                                                        Attempts: {exam.attempt_count || 0} / {exam.max_attempts}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            );
                        })()
                    )}
                </section>

            </main>

            {/* Footer */}
            <footer className="border-t border-gray-200 bg-white/60 backdrop-blur-sm mt-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-1">
                    <p className="text-[11px] text-gray-400 tracking-wide">© 2026 ExamGuard Global. All rights reserved.</p>
                    <p className="text-[11px] text-gray-400 tracking-wide">Crafted by <span className="font-medium text-gray-500">Om Chandrakant Deo</span></p>
                </div>
            </footer>
        </div>
    );
};

export default DashboardPage;
