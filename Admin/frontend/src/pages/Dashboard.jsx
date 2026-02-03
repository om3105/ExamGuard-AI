import { useEffect, useState } from 'react';
import { analyticsAPI, examAPI } from '../services/adminApi';
import { FileText, Users, ClipboardCheck, TrendingUp, Calendar, Clock, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [exams, setExams] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const [overviewRes, examsRes] = await Promise.all([
                analyticsAPI.getOverview(),
                examAPI.getAll()
            ]);
            setStats(overviewRes.data);
            setExams(examsRes.data);
        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    // Sort exams by start time (newest first) and take latest 5
    const recentExams = [...exams].sort((a, b) => new Date(b.start_time) - new Date(a.start_time)).slice(0, 5);

    const getExamStatus = (exam) => {
        const now = new Date();
        const start = new Date(exam.start_time);
        const end = new Date(start.getTime() + exam.duration_minutes * 60000);

        if (now < start) return { label: 'Upcoming', color: 'bg-yellow-100 text-yellow-800' };
        if (now >= start && now <= end) return { label: 'Active', color: 'bg-green-100 text-green-800' };
        return { label: 'Completed', color: 'bg-gray-100 text-gray-800' };
    };

    const StatCard = ({ title, value, subtext, badgeColor, badgeText, icon: Icon }) => (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col justify-between h-full hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
                <div>
                    <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">{title}</h3>
                    <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
                </div>
                <div className={`p-2 rounded-lg ${badgeColor} bg-opacity-20`}>
                    <Icon className={`w-5 h-5 ${badgeText}`} />
                </div>
            </div>
            <div className="mt-4 text-xs text-gray-500 flex items-center gap-1">
                {subtext}
            </div>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Welcome Section */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
                <p className="text-gray-500 mt-1">Manage system overview, exams, and student records.</p>
            </div>

            {/* Status Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <StatCard
                    title="Total Exams"
                    value={stats?.total_exams || 0}
                    subtext="All assessments"
                    badgeColor="bg-blue-100"
                    badgeText="text-blue-600"
                    icon={FileText}
                />
                <StatCard
                    title="Total Students"
                    value={stats?.total_students || 0}
                    subtext="Registered candidates"
                    badgeColor="bg-green-100"
                    badgeText="text-green-600"
                    icon={Users}
                />
                <StatCard
                    title="Submissions"
                    value={stats?.total_submissions || 0}
                    subtext="Total completed"
                    badgeColor="bg-purple-100"
                    badgeText="text-purple-600"
                    icon={ClipboardCheck}
                />
                <StatCard
                    title="Avg Score"
                    value={`${stats?.recent_submissions?.length > 0
                        ? Math.round(stats.recent_submissions.reduce((acc, curr) => acc + (curr.score || 0), 0) / stats.recent_submissions.length)
                        : 0}`}
                    subtext="Across all exams"
                    badgeColor="bg-orange-100"
                    badgeText="text-orange-600"
                    icon={TrendingUp}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Exams Section */}
                <div className="lg:col-span-2 space-y-6">
                    <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                            <h2 className="font-semibold text-gray-800">Recent Exams</h2>
                            <button
                                onClick={() => navigate('/exams')}
                                className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
                            >
                                View All <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>

                        {recentExams.length > 0 ? (
                            <div className="divide-y divide-gray-100">
                                {recentExams.map((exam) => {
                                    const status = getExamStatus(exam);
                                    return (
                                        <div key={exam._id} className="p-6 hover:bg-gray-50 transition-colors group">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                                                            {exam.title}
                                                        </h3>
                                                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${status.color}`}>
                                                            {status.label}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-gray-500 mt-1 line-clamp-1">
                                                        {exam.description || 'No description provided'}
                                                    </p>
                                                    <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                                                        <div className="flex items-center gap-1">
                                                            <Calendar className="w-3 h-3" />
                                                            <span>
                                                                {new Date(exam.start_time).toLocaleDateString()}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <Clock className="w-3 h-3" />
                                                            <span>{exam.duration_minutes} mins</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => navigate(`/exams?id=${exam._id}`)}
                                                    className="px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                                                >
                                                    Details
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="p-12 text-center">
                                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <FileText className="w-6 h-6 text-gray-400" />
                                </div>
                                <h3 className="text-sm font-medium text-gray-900">No exams yet</h3>
                                <p className="text-xs text-gray-500 mt-1 mb-4">Create an exam to see it here.</p>
                                <button
                                    onClick={() => navigate('/create-exam')}
                                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    Create Exam
                                </button>
                            </div>
                        )}
                    </section>
                </div>

                {/* Recent Submissions */}
                <div className="lg:col-span-1">
                    <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden h-full">
                        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                            <h2 className="font-semibold text-gray-800">Recent Activity</h2>
                        </div>

                        {stats?.recent_submissions && stats.recent_submissions.length > 0 ? (
                            <div className="divide-y divide-gray-100">
                                {stats.recent_submissions.slice(0, 5).map((submission) => (
                                    <div key={submission.id} className="p-4 hover:bg-gray-50 transition-colors">
                                        <div className="flex justify-between items-start mb-1">
                                            <span className="text-sm font-medium text-gray-900 line-clamp-1">{submission.exam_title}</span>
                                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${submission.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                                }`}>
                                                {submission.status}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center text-xs text-gray-500">
                                            <span>User: {submission.user_id}</span>
                                            <span>{new Date(submission.submitted_at).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-8 text-center text-gray-500 text-sm">
                                No recent activity
                            </div>
                        )}
                    </section>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
