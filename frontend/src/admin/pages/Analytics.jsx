import { useEffect, useState } from 'react';
import { analyticsAPI, examAPI } from '../../services/adminApi';
import { BarChart3, TrendingUp, Users, FileText, AlertTriangle, ShieldAlert, Activity } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const Analytics = () => {
    const [overview, setOverview] = useState(null);
    const [examStats, setExamStats] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => { fetchAnalytics(); }, []);

    const fetchAnalytics = async () => {
        try {
            const [overviewRes, examsRes] = await Promise.all([
                analyticsAPI.getOverview(),
                examAPI.getAll()
            ]);
            setOverview(overviewRes.data);

            const examDetails = await Promise.all(
                examsRes.data.map(async (exam) => {
                    try {
                        const results = await analyticsAPI.getExamResults(exam._id);
                        return { ...exam, submissions: results.data.submissions || [] };
                    } catch { return { ...exam, submissions: [] }; }
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

    // Chart data
    const examChartData = examStats.map(exam => ({
        name: exam.title.length > 20 ? exam.title.substring(0, 20) + '...' : exam.title,
        submissions: exam.submissions.length,
        avgScore: exam.submissions.length > 0
            ? Math.round(exam.submissions.reduce((sum, sub) => sum + (sub.score || 0), 0) / exam.submissions.length)
            : 0
    }));

    const riskData = [
        { name: 'Low Risk', value: overview?.recent_submissions?.filter(s => s.risk_level === 'LOW' || !s.risk_level).length || 0, color: '#10B981' },
        { name: 'Medium Risk', value: overview?.recent_submissions?.filter(s => s.risk_level === 'MEDIUM').length || 0, color: '#F59E0B' },
        { name: 'High Risk', value: overview?.recent_submissions?.filter(s => s.risk_level === 'HIGH').length || 0, color: '#EF4444' }
    ].filter(d => d.value > 0);

    const COLORS = { 'Low Risk': '#10B981', 'Medium Risk': '#F59E0B', 'High Risk': '#EF4444' };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-800">Analytics Dashboard</h1>
                <p className="text-gray-500 mt-1">Comprehensive insights into exam performance and integrity</p>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mb-8">
                {[
                    { label: 'Total Exams', value: overview?.total_exams || 0, icon: FileText, color: 'text-blue-600 bg-blue-50' },
                    { label: 'Total Students', value: overview?.total_students || 0, icon: Users, color: 'text-emerald-600 bg-emerald-50' },
                    { label: 'Submissions', value: overview?.total_submissions || 0, icon: TrendingUp, color: 'text-purple-600 bg-purple-50' },
                    { label: 'Avg Risk Score', value: overview?.avg_anomaly_score || 0, icon: Activity, color: overview?.avg_anomaly_score > 50 ? 'text-red-600 bg-red-50' : 'text-amber-600 bg-amber-50' },
                    { label: 'High Risk', value: overview?.high_risk_submissions || 0, icon: AlertTriangle, color: 'text-red-600 bg-red-50' },
                ].map(({ label, value, icon: Icon, color }) => (
                    <div key={label} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex items-start justify-between">
                        <div>
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{label}</p>
                            <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
                        </div>
                        <div className={`p-2 rounded-lg ${color}`}>
                            <Icon className="w-5 h-5" />
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
                {/* Submissions & Avg Score Bar Chart */}
                <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-base font-semibold text-gray-800 mb-4">Exam Performance Overview</h3>
                    {examChartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={280}>
                            <BarChart data={examChartData} barGap={4}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                                <XAxis dataKey="name" stroke="#9ca3af" fontSize={11} tickLine={false} axisLine={false} />
                                <YAxis stroke="#9ca3af" fontSize={11} tickLine={false} axisLine={false} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#fff', borderRadius: '10px', border: '1px solid #e5e7eb', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', fontSize: '13px' }}
                                    cursor={{ fill: 'rgba(99, 102, 241, 0.05)' }}
                                />
                                <Legend wrapperStyle={{ fontSize: '12px' }} />
                                <Bar dataKey="submissions" name="Submissions" fill="#6366f1" radius={[6, 6, 0, 0]} />
                                <Bar dataKey="avgScore" name="Avg Score" fill="#10b981" radius={[6, 6, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-64 flex flex-col items-center justify-center text-gray-400">
                            <BarChart3 className="w-10 h-10 mb-2 opacity-40" />
                            <p className="text-sm">No exam data available</p>
                        </div>
                    )}
                </div>

                {/* Risk Distribution Donut */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-base font-semibold text-gray-800 mb-4">Integrity Risk</h3>
                    {riskData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={280}>
                            <PieChart>
                                <Pie
                                    data={riskData}
                                    cx="50%"
                                    cy="45%"
                                    innerRadius={55}
                                    outerRadius={85}
                                    paddingAngle={4}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {riskData.map((entry) => (
                                        <Cell key={entry.name} fill={COLORS[entry.name]} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ borderRadius: '10px', border: '1px solid #e5e7eb', fontSize: '13px' }} />
                                <Legend
                                    verticalAlign="bottom"
                                    iconType="circle"
                                    iconSize={8}
                                    wrapperStyle={{ fontSize: '12px' }}
                                    formatter={(value) => <span className="text-gray-600">{value}</span>}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-64 flex flex-col items-center justify-center text-gray-400">
                            <ShieldAlert className="w-10 h-10 mb-2 opacity-40" />
                            <p className="text-sm">No risk data</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Recent Activity Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                    <h3 className="text-base font-semibold text-gray-800">Recent Submissions</h3>
                    <span className="text-xs text-gray-400">{overview?.recent_submissions?.length || 0} latest</span>
                </div>
                {overview?.recent_submissions && overview.recent_submissions.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead className="bg-gray-50/80">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Student</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Exam</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Risk Level</th>
                                    <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Score</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {overview.recent_submissions.map((sub) => (
                                    <tr key={sub.id} className="hover:bg-gray-50/50 transition">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs">
                                                    {(sub.student_name || 'U').charAt(0).toUpperCase()}
                                                </div>
                                                <span className="text-sm font-medium text-gray-900">{sub.student_name || 'Unknown'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600 max-w-[200px] truncate">{sub.exam_title}</td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${sub.risk_level === 'HIGH' ? 'bg-red-50 text-red-700 border border-red-200' :
                                                    sub.risk_level === 'MEDIUM' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                                                        'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                                }`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${sub.risk_level === 'HIGH' ? 'bg-red-500' :
                                                        sub.risk_level === 'MEDIUM' ? 'bg-amber-500' : 'bg-emerald-500'
                                                    }`}></span>
                                                {sub.risk_level === 'HIGH' ? 'High' : sub.risk_level === 'MEDIUM' ? 'Medium' : 'Low'}
                                                <span className="text-[10px] opacity-70">({sub.anomaly_score || 0})</span>
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="text-sm font-bold text-gray-900">{sub.score !== null ? sub.score : '—'}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`text-xs font-medium ${sub.status === 'GRADED' ? 'text-green-600' : sub.status === 'COMPLETED' ? 'text-blue-600' : 'text-gray-500'}`}>
                                                {sub.status || 'N/A'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right text-sm text-gray-500">
                                            {new Date(sub.submitted_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="p-10 text-center text-gray-400">
                        <Activity className="w-10 h-10 mx-auto mb-2 opacity-40" />
                        <p className="text-sm">No recent activity</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Analytics;
