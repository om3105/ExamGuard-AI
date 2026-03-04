import { useEffect, useState } from 'react';
import { analyticsAPI, examAPI } from '../services/adminApi';
import { BarChart3, TrendingUp, Users, FileText, CheckCircle, AlertTriangle, ShieldAlert } from 'lucide-react';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';

const Analytics = () => {
    const [overview, setOverview] = useState(null);
    const [examStats, setExamStats] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        try {
            const [overviewRes, examsRes] = await Promise.all([
                analyticsAPI.getOverview(),
                examAPI.getAll()
            ]);

            setOverview(overviewRes.data);

            // Get detailed stats for each exam
            const examDetails = await Promise.all(
                examsRes.data.map(async (exam) => {
                    try {
                        const results = await analyticsAPI.getExamResults(exam._id);
                        return {
                            ...exam,
                            submissions: results.data.submissions || []
                        };
                    } catch (error) {
                        return { ...exam, submissions: [] };
                    }
                })
            );

            setExamStats(examDetails);
        } catch (error) {
            console.error('Failed to fetch analytics:', error);
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

    // Prepare chart data
    const examPerformanceData = examStats.map(exam => ({
        name: exam.title.length > 15 ? exam.title.substring(0, 15) + '...' : exam.title,
        submissions: exam.submissions.length,
        avgScore: exam.submissions.length > 0
            ? Math.round(exam.submissions.reduce((sum, sub) => sum + (sub.score || 0), 0) / exam.submissions.length)
            : 0
    }));

    // Integrity Risk Distribution (Pie Chart)
    const riskData = [
        { name: 'Low Risk', value: overview?.recent_submissions?.filter(s => s.risk_level === 'LOW' || !s.risk_level).length || 0, color: '#10B981' },
        { name: 'Medium Risk', value: overview?.recent_submissions?.filter(s => s.risk_level === 'MEDIUM').length || 0, color: '#F59E0B' },
        { name: 'High Risk', value: overview?.recent_submissions?.filter(s => s.risk_level === 'HIGH').length || 0, color: '#EF4444' }
    ];

    const performanceTrendData = examStats.map((exam, index) => ({
        name: `Exam ${index + 1}`,
        score: exam.submissions.length > 0
            ? Math.round(exam.submissions.reduce((sum, sub) => sum + (sub.score || 0), 0) / exam.submissions.length)
            : 0,
        submissions: exam.submissions.length
    }));

    const COLORS = ['#10B981', '#F59E0B', '#EF4444'];

    const StatCard = ({ title, value, subtext, icon: Icon, colorClass }) => (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">{title}</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
                    {subtext && <p className="text-sm text-gray-500 mt-1">{subtext}</p>}
                </div>
                <div className={`p-2 rounded-lg ${colorClass}`}>
                    <Icon className="w-6 h-6" />
                </div>
            </div>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header Section */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-800">Analytics Dashboard</h1>
                <p className="text-gray-500 mt-1">Comprehensive insights into exam performance</p>
            </div>

            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard
                    title="Total Exams"
                    value={overview?.total_exams || 0}
                    subtext="Active in system"
                    icon={FileText}
                    colorClass="bg-blue-100 text-blue-600"
                />
                <StatCard
                    title="Total Students"
                    value={overview?.total_students || 0}
                    subtext="Registered users"
                    icon={Users}
                    colorClass="bg-green-100 text-green-600"
                />
                <StatCard
                    title="Submissions"
                    value={overview?.total_submissions || 0}
                    subtext="Total attempts"
                    icon={TrendingUp}
                    colorClass="bg-purple-100 text-purple-600"
                />
                <StatCard
                    title="Average Risk Score"
                    value={overview?.avg_anomaly_score || 0}
                    subtext="Out of 100"
                    icon={ShieldAlert}
                    colorClass={`bg-blue-100 ${overview?.avg_anomaly_score > 60 ? 'text-red-600' : 'text-blue-600'}`}
                />
                <StatCard
                    title="High Risk Submissions"
                    value={overview?.high_risk_submissions || 0}
                    subtext="Requires manual review"
                    icon={AlertTriangle}
                    colorClass="bg-red-100 text-red-600"
                />
            </div>


            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-6">Exam Submissions</h3>
                    {examPerformanceData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={examPerformanceData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                                <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                    cursor={{ fill: '#f9fafb' }}
                                />
                                <Bar dataKey="submissions" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-64 flex flex-col items-center justify-center text-gray-400">
                            <BarChart3 className="w-12 h-12 mb-2 opacity-50" />
                            <p>No data available</p>
                        </div>
                    )}
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-6">Integrity Risk Distribution</h3>
                    {riskData.some(d => d.value > 0) ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={riskData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {riskData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-64 flex flex-col items-center justify-center text-gray-400">
                            <div className="w-12 h-12 rounded-full border-2 border-gray-200 mb-2 opacity-50"></div>
                            <p>No risk data available</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Recent Activity Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-800">Recent Activity</h3>
                </div>
                <div className="p-0">
                    {overview?.recent_submissions && overview.recent_submissions.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Exam</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student ID</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Integrity Risk</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {overview.recent_submissions.slice(0, 10).map((submission) => (
                                        <tr key={submission.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {submission.exam_title}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {submission.user_id}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {submission.risk_level === 'HIGH' ? (
                                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800 border border-red-200">
                                                        High Risk ({submission.anomaly_score})
                                                    </span>
                                                ) : submission.risk_level === 'MEDIUM' ? (
                                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800 border border-yellow-200">
                                                        Med Risk ({submission.anomaly_score})
                                                    </span>
                                                ) : (
                                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 border border-green-200">
                                                        Low Risk ({submission.anomaly_score || 0})
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {submission.score !== null ? submission.score : '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {new Date(submission.submitted_at).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="p-8 text-center text-gray-500">
                            No recent activity recorded.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Analytics;
