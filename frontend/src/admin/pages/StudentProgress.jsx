import { useState, useEffect } from 'react';
import { progressAPI } from '../services/adminApi';
import {
    Users, BookOpen, Award, TrendingUp, Code, Search, ChevronDown, ChevronUp,
    AlertTriangle, Clock, ArrowLeft, BarChart3, X
} from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from 'recharts';

const COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

const StudentProgress = () => {
    const [overview, setOverview] = useState(null);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [sortField, setSortField] = useState('full_name');
    const [sortDir, setSortDir] = useState('asc');
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [studentDetail, setStudentDetail] = useState(null);
    const [detailLoading, setDetailLoading] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [ovRes, stRes] = await Promise.all([
                progressAPI.getOverview(),
                progressAPI.getStudents()
            ]);
            setOverview(ovRes.data);
            setStudents(stRes.data);
        } catch (err) {
            console.error('Failed to load progress data:', err);
        } finally {
            setLoading(false);
        }
    };

    const openDetail = async (student) => {
        setSelectedStudent(student);
        setDetailLoading(true);
        try {
            const res = await progressAPI.getStudentDetail(student._id);
            setStudentDetail(res.data);
        } catch (err) {
            console.error('Failed to load student detail:', err);
        } finally {
            setDetailLoading(false);
        }
    };

    const closeDetail = () => {
        setSelectedStudent(null);
        setStudentDetail(null);
    };

    // Filtering and sorting
    const filtered = students
        .filter(s => {
            const term = search.toLowerCase();
            return (s.full_name?.toLowerCase().includes(term) || s.email?.toLowerCase().includes(term) || s.username?.toLowerCase().includes(term));
        })
        .sort((a, b) => {
            let aVal = a[sortField] ?? '';
            let bVal = b[sortField] ?? '';
            if (typeof aVal === 'string') aVal = aVal.toLowerCase();
            if (typeof bVal === 'string') bVal = bVal.toLowerCase();
            if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
            if (aVal > bVal) return sortDir === 'asc' ? 1 : -1;
            return 0;
        });

    const toggleSort = (field) => {
        if (sortField === field) {
            setSortDir(d => d === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDir('asc');
        }
    };

    const SortIcon = ({ field }) => {
        if (sortField !== field) return <ChevronDown className="w-3 h-3 text-gray-300" />;
        return sortDir === 'asc' ? <ChevronUp className="w-3 h-3 text-indigo-600" /> : <ChevronDown className="w-3 h-3 text-indigo-600" />;
    };

    const getAlertBadge = (alerts) => {
        if (!alerts || alerts.length === 0) return null;
        const badgeMap = {
            low_quiz: { label: 'Low Quiz', color: 'bg-red-100 text-red-700' },
            low_completion: { label: 'Low Progress', color: 'bg-amber-100 text-amber-700' },
            inactive: { label: 'Inactive', color: 'bg-gray-100 text-gray-600' },
        };
        return (
            <div className="flex flex-wrap gap-1">
                {alerts.map(a => {
                    const badge = badgeMap[a];
                    return badge ? (
                        <span key={a} className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${badge.color}`}>
                            {badge.label}
                        </span>
                    ) : null;
                })}
            </div>
        );
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="flex flex-col items-center gap-3">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                    <p className="text-sm text-gray-500">Loading student progress...</p>
                </div>
            </div>
        );
    }

    // ─── DETAIL VIEW ───
    if (selectedStudent) {
        return (
            <div className="p-6 lg:p-8 max-w-6xl mx-auto">
                <button onClick={closeDetail} className="flex items-center gap-2 text-gray-600 hover:text-gray-800 font-medium mb-6">
                    <ArrowLeft className="w-5 h-5" /> Back to Progress Dashboard
                </button>

                {detailLoading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
                    </div>
                ) : studentDetail ? (
                    <div className="space-y-6">
                        {/* Student Header */}
                        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-white">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold">
                                    {studentDetail.student.full_name?.charAt(0)?.toUpperCase() || '?'}
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold">{studentDetail.student.full_name}</h2>
                                    <p className="text-white/70">{studentDetail.student.email} · {studentDetail.student.college || 'N/A'}</p>
                                </div>
                            </div>
                            {studentDetail.high_risk_count > 0 && (
                                <div className="mt-4 bg-red-500/30 rounded-lg px-4 py-2 flex items-center gap-2">
                                    <AlertTriangle className="w-4 h-4" />
                                    <span className="text-sm font-medium">{studentDetail.high_risk_count} high-risk exam submission(s)</span>
                                </div>
                            )}
                        </div>

                        {/* Course Progress */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2"><BookOpen className="w-5 h-5 text-indigo-600" /> Course Progress</h3>
                            {studentDetail.course_progress.length === 0 ? (
                                <p className="text-gray-500 text-sm">No course progress recorded.</p>
                            ) : (
                                <div className="space-y-4">
                                    {studentDetail.course_progress.map((cp, i) => (
                                        <div key={i} className="border border-gray-100 rounded-lg p-4">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="font-semibold text-gray-800">{cp.course_title}</span>
                                                <span className="text-sm font-bold text-indigo-600">{cp.progress_percentage}%</span>
                                            </div>
                                            <div className="w-full bg-gray-100 rounded-full h-2.5 mb-2">
                                                <div className="bg-indigo-500 h-2.5 rounded-full transition-all" style={{ width: `${cp.progress_percentage}%` }}></div>
                                            </div>
                                            <p className="text-xs text-gray-500">Lessons: {cp.completed_lessons} / {cp.total_lessons}</p>
                                        </div>
                                    ))}

                                    {/* Course Completion Chart */}
                                    {studentDetail.course_progress.length > 0 && (
                                        <div className="mt-4 h-64">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart data={studentDetail.course_progress.map(cp => ({ name: cp.course_title.substring(0, 15), progress: cp.progress_percentage }))}>
                                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                                                    <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                                                    <Tooltip />
                                                    <Bar dataKey="progress" fill="#6366f1" radius={[6, 6, 0, 0]} />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Quiz Performance */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2"><Award className="w-5 h-5 text-green-600" /> Quiz Performance</h3>
                            {studentDetail.quiz_results.length === 0 ? (
                                <p className="text-gray-500 text-sm">No quiz attempts recorded.</p>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead><tr className="border-b border-gray-200">
                                            <th className="text-left py-3 px-4 font-semibold text-gray-600">Quiz</th>
                                            <th className="text-left py-3 px-4 font-semibold text-gray-600">Course</th>
                                            <th className="text-right py-3 px-4 font-semibold text-gray-600">Score</th>
                                        </tr></thead>
                                        <tbody>
                                            {studentDetail.quiz_results.map((q, i) => (
                                                <tr key={i} className="border-b border-gray-50 hover:bg-gray-50">
                                                    <td className="py-3 px-4 font-medium text-gray-800">{q.quiz_title}</td>
                                                    <td className="py-3 px-4 text-gray-500">{q.course}</td>
                                                    <td className="py-3 px-4 text-right">
                                                        <span className={`font-bold ${q.score >= 70 ? 'text-green-600' : q.score >= 50 ? 'text-amber-600' : 'text-red-600'}`}>{q.score}%</span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>

                        {/* Coding Results */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2"><Code className="w-5 h-5 text-purple-600" /> Coding Challenge Results</h3>
                            {studentDetail.coding_results.length === 0 ? (
                                <p className="text-gray-500 text-sm">No coding submissions recorded.</p>
                            ) : (
                                <>
                                    <div className="overflow-x-auto mb-4">
                                        <table className="w-full text-sm">
                                            <thead><tr className="border-b border-gray-200">
                                                <th className="text-left py-3 px-4 font-semibold text-gray-600">Problem</th>
                                                <th className="text-left py-3 px-4 font-semibold text-gray-600">Course</th>
                                                <th className="text-left py-3 px-4 font-semibold text-gray-600">Status</th>
                                                <th className="text-right py-3 px-4 font-semibold text-gray-600">Score</th>
                                            </tr></thead>
                                            <tbody>
                                                {studentDetail.coding_results.map((c, i) => (
                                                    <tr key={i} className="border-b border-gray-50 hover:bg-gray-50">
                                                        <td className="py-3 px-4 font-medium text-gray-800">{c.problem_title}</td>
                                                        <td className="py-3 px-4 text-gray-500">{c.course}</td>
                                                        <td className="py-3 px-4">
                                                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${c.status === 'Passed' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{c.status}</span>
                                                        </td>
                                                        <td className="py-3 px-4 text-right font-bold text-gray-700">{c.score}%</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    {/* Coding Success Pie */}
                                    {studentDetail.coding_results.length > 0 && (
                                        <div className="h-48">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <PieChart>
                                                    <Pie
                                                        data={[
                                                            { name: 'Passed', value: studentDetail.coding_results.filter(c => c.status === 'Passed').length },
                                                            { name: 'Failed', value: studentDetail.coding_results.filter(c => c.status === 'Failed').length },
                                                        ]}
                                                        cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={5} dataKey="value"
                                                    >
                                                        <Cell fill="#22c55e" /><Cell fill="#ef4444" />
                                                    </Pie>
                                                    <Tooltip />
                                                    <Legend />
                                                </PieChart>
                                            </ResponsiveContainer>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>

                        {/* Exam History */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2"><BarChart3 className="w-5 h-5 text-blue-600" /> Exam History</h3>
                            {studentDetail.exam_history.length === 0 ? (
                                <p className="text-gray-500 text-sm">No exams attempted.</p>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead><tr className="border-b border-gray-200">
                                            <th className="text-left py-3 px-4 font-semibold text-gray-600">Exam</th>
                                            <th className="text-center py-3 px-4 font-semibold text-gray-600">Attempt</th>
                                            <th className="text-right py-3 px-4 font-semibold text-gray-600">MCQ</th>
                                            <th className="text-right py-3 px-4 font-semibold text-gray-600">Coding</th>
                                            <th className="text-right py-3 px-4 font-semibold text-gray-600">Total</th>
                                            <th className="text-center py-3 px-4 font-semibold text-gray-600">Integrity</th>
                                            <th className="text-right py-3 px-4 font-semibold text-gray-600">Date</th>
                                        </tr></thead>
                                        <tbody>
                                            {studentDetail.exam_history.map((ex, i) => (
                                                <tr key={i} className="border-b border-gray-50 hover:bg-gray-50">
                                                    <td className="py-3 px-4 font-medium text-gray-800">{ex.exam_title}</td>
                                                    <td className="py-3 px-4 text-center text-gray-500">#{ex.attempt_number}</td>
                                                    <td className="py-3 px-4 text-right text-gray-700">{ex.mcq_score ?? '-'}</td>
                                                    <td className="py-3 px-4 text-right text-gray-700">{ex.coding_score ?? '-'}</td>
                                                    <td className="py-3 px-4 text-right font-bold text-gray-900">{ex.score ?? '-'}</td>
                                                    <td className="py-3 px-4 text-center">
                                                        {ex.risk_level && (
                                                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${ex.risk_level === 'HIGH' ? 'bg-red-100 text-red-700' : ex.risk_level === 'MEDIUM' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
                                                                {ex.risk_level}
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="py-3 px-4 text-right text-gray-500 text-xs">
                                                        {ex.submitted_at ? new Date(ex.submitted_at).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }) : '-'}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>

                        {/* Integrity Warnings */}
                        {studentDetail.integrity_warnings.length > 0 && (
                            <div className="bg-red-50 rounded-xl border border-red-200 p-6">
                                <h3 className="text-lg font-bold text-red-800 mb-4 flex items-center gap-2"><AlertTriangle className="w-5 h-5" /> Integrity Warnings</h3>
                                <div className="space-y-2">
                                    {studentDetail.integrity_warnings.map((w, i) => (
                                        <div key={i} className="flex items-center gap-4 bg-white rounded-lg px-4 py-3 border border-red-100">
                                            <span className="text-sm text-gray-700">Exam: <span className="font-mono font-medium">{w.exam_id.slice(-6)}</span></span>
                                            <span className="text-sm text-red-600 font-medium">{w.tab_switches} tab switches</span>
                                            <span className="text-sm text-red-600 font-medium">{w.paste_count} pastes ({w.pasted_chars} chars)</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <p className="text-gray-500">Failed to load student details.</p>
                )}
            </div>
        );
    }

    // ─── MAIN DASHBOARD VIEW ───
    return (
        <div className="p-6 lg:p-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Student Progress</h1>
                <p className="text-gray-500 mt-1">Monitor learning analytics across courses, quizzes, and exams</p>
            </div>

            {/* Metrics Strip */}
            {overview && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
                    {[
                        { label: 'Total Students', value: overview.total_students, icon: Users, color: 'bg-blue-50 text-blue-600', iconBg: 'bg-blue-100' },
                        { label: 'Active Courses', value: overview.total_courses, icon: BookOpen, color: 'bg-indigo-50 text-indigo-600', iconBg: 'bg-indigo-100' },
                        { label: 'Avg Completion', value: `${overview.avg_course_completion}%`, icon: TrendingUp, color: 'bg-green-50 text-green-600', iconBg: 'bg-green-100' },
                        { label: 'Avg Quiz Score', value: `${overview.avg_quiz_score}%`, icon: Award, color: 'bg-amber-50 text-amber-600', iconBg: 'bg-amber-100' },
                        { label: 'Avg Coding Score', value: `${overview.avg_coding_score}%`, icon: Code, color: 'bg-purple-50 text-purple-600', iconBg: 'bg-purple-100' },
                        { label: 'Exam Submissions', value: overview.total_exam_submissions, icon: BarChart3, color: 'bg-rose-50 text-rose-600', iconBg: 'bg-rose-100' },
                    ].map((m, i) => {
                        const Icon = m.icon;
                        return (
                            <div key={i} className={`${m.color} rounded-xl p-4 border border-transparent`}>
                                <div className={`w-9 h-9 ${m.iconBg} rounded-lg flex items-center justify-center mb-3`}>
                                    <Icon className="w-5 h-5" />
                                </div>
                                <p className="text-2xl font-bold">{m.value}</p>
                                <p className="text-xs font-medium opacity-70 mt-1">{m.label}</p>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Search + Alert Legend */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
                <div className="relative w-full sm:w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text" value={search} onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search by name or email..."
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                </div>
                <div className="flex items-center gap-2 text-xs">
                    <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-bold">Low Quiz</span>
                    <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-bold">Low Progress</span>
                    <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 font-bold">Inactive 7d+</span>
                </div>
            </div>

            {/* Student Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                {[
                                    { key: 'full_name', label: 'Student' },
                                    { key: 'course_progress_pct', label: 'Course %' },
                                    { key: 'quiz_avg', label: 'Quiz Avg' },
                                    { key: 'coding_avg', label: 'Coding Avg' },
                                    { key: 'exams_attempted', label: 'Exams' },
                                    { key: 'last_activity', label: 'Last Activity' },
                                    { key: 'alerts', label: 'Status' },
                                ].map(col => (
                                    <th key={col.key}
                                        onClick={() => toggleSort(col.key)}
                                        className="text-left py-3.5 px-4 font-semibold text-gray-600 cursor-pointer select-none hover:bg-gray-100 transition-colors">
                                        <div className="flex items-center gap-1">
                                            {col.label} <SortIcon field={col.key} />
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length === 0 ? (
                                <tr><td colSpan={7} className="text-center py-12 text-gray-400">No students found</td></tr>
                            ) : (
                                filtered.map((s) => (
                                    <tr key={s._id}
                                        onClick={() => openDetail(s)}
                                        className="border-b border-gray-50 hover:bg-indigo-50/50 cursor-pointer transition-colors">
                                        <td className="py-3.5 px-4">
                                            <div>
                                                <p className="font-medium text-gray-900">{s.full_name}</p>
                                                <p className="text-xs text-gray-400">{s.email}</p>
                                            </div>
                                        </td>
                                        <td className="py-3.5 px-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-16 bg-gray-100 rounded-full h-1.5">
                                                    <div className={`h-1.5 rounded-full ${s.course_progress_pct >= 70 ? 'bg-green-500' : s.course_progress_pct >= 40 ? 'bg-amber-500' : 'bg-red-500'}`}
                                                        style={{ width: `${s.course_progress_pct}%` }}></div>
                                                </div>
                                                <span className="text-xs font-bold text-gray-600">{s.course_progress_pct}%</span>
                                            </div>
                                        </td>
                                        <td className="py-3.5 px-4">
                                            <span className={`font-bold ${s.quiz_avg >= 70 ? 'text-green-600' : s.quiz_avg >= 50 ? 'text-amber-600' : 'text-red-600'}`}>
                                                {s.quiz_avg > 0 ? `${s.quiz_avg}%` : '-'}
                                            </span>
                                        </td>
                                        <td className="py-3.5 px-4">
                                            <span className={`font-bold ${s.coding_avg >= 70 ? 'text-green-600' : s.coding_avg >= 50 ? 'text-amber-600' : 'text-red-600'}`}>
                                                {s.coding_avg > 0 ? `${s.coding_avg}%` : '-'}
                                            </span>
                                        </td>
                                        <td className="py-3.5 px-4 text-gray-700 font-medium">{s.exams_attempted}</td>
                                        <td className="py-3.5 px-4 text-gray-500 text-xs">
                                            {s.last_activity
                                                ? new Date(s.last_activity).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', hour12: true })
                                                : '-'}
                                        </td>
                                        <td className="py-3.5 px-4">{getAlertBadge(s.alerts)}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default StudentProgress;
