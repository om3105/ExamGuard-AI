import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const DashboardPage = () => {
    const { username, logout } = useAuth();
    const navigate = useNavigate();

    const [exams, setExams] = React.useState([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchExams = async () => {
            try {
                const { getExams } = await import('../services/api');
                const data = await getExams();
                setExams(data);
            } catch (error) {
                console.error("Failed to fetch exams:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchExams();
    }, []);

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
                        <div className="flex items-center gap-3">
                            <img src="/src/assets/logo.png" alt="ExamGuard Logo" className="w-16 h-16 object-contain" />
                            <span className="font-bold text-xl tracking-tight text-gray-800">ExamGuard <span className="text-blue-600">Global</span></span>
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

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                {/* Welcome Section */}
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-800">Candidate Dashboard</h1>
                    <p className="text-gray-500 mt-1">Manage your assessments and view your performance reports.</p>
                </div>

                {/* Status Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {/* Card 1 */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col justify-between">
                        <div className="flex items-start justify-between">
                            <div>
                                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">System Status</h3>
                                <p className="text-2xl font-bold text-gray-900 mt-2">Ready</p>
                            </div>
                            <span className="bg-green-100 text-green-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">Verified</span>
                        </div>
                        <div className="mt-4 text-xs text-gray-500">
                            Browser, Camera, and Network checks passed.
                        </div>
                    </div>

                    {/* Card 2 */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col justify-between">
                        <div className="flex items-start justify-between">
                            <div>
                                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Biometric Profile</h3>
                                <p className="text-2xl font-bold text-gray-900 mt-2">98%</p>
                            </div>
                            <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">Active</span>
                        </div>
                        <div className="mt-4 text-xs text-gray-500">
                            Keystroke dynamics calibrated successfully.
                        </div>
                    </div>

                    {/* Card 3 */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col justify-between">
                        <div className="flex items-start justify-between">
                            <div>
                                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Pending Exams</h3>
                                <p className="text-2xl font-bold text-gray-900 mt-2">{exams.length}</p>
                            </div>
                            <span className="bg-gray-100 text-gray-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">View All</span>
                        </div>
                        <div className="mt-4 text-xs text-gray-500">
                            No assessments scheduled for this week.
                        </div>
                    </div>
                </div>

                {/* Action Area / Empty State */}
                <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                        <h2 className="font-semibold text-gray-800">Assigned Assessments</h2>
                        <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">Refresh List</button>
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
                        <>
                            <div className="p-8 border-b border-gray-100 bg-blue-50/50">
                                <h3 className="text-sm font-bold text-blue-800 uppercase tracking-wide mb-4">Next Up</h3>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900">{exams[0].title}</h2>
                                        <p className="text-gray-600 mt-1 max-w-xl">{exams[0].description}</p>
                                        <div className="flex gap-4 mt-3 text-sm text-gray-500 font-medium">
                                            <span className="flex items-center gap-1">
                                                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                                                {new Date(exams[0].start_time).toLocaleString()}
                                            </span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => navigate(`/exam/${exams[0]._id}/waiting-room`)}
                                        className="px-6 py-3 bg-blue-600 text-white font-bold rounded-lg shadow-md hover:bg-blue-700 transition-colors"
                                    >
                                        Enter Waiting Room
                                    </button>
                                </div>
                            </div>
                            <div className="divide-y divide-gray-100">
                                {exams.map((exam) => (
                                    <div key={exam._id} className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
                                        <div className="flex items-start gap-4">
                                            <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                                                {exam.title.charAt(0)}
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-gray-900">{exam.title}</h3>
                                                <p className="text-sm text-gray-500 mt-1 line-clamp-1">{exam.description}</p>
                                                <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                                                    <span className="flex items-center gap-1">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                                        {exam.duration_minutes} Mins
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                                        {exam.total_marks} Marks
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => navigate(`/exam/${exam._id}/waiting-room`)}
                                            className="px-5 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg shadow-sm hover:bg-blue-700 transition-colors"
                                        >
                                            Start Exam
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </section>

            </main>
        </div>
    );
};

export default DashboardPage;
