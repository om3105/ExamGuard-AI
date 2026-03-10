import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { analyticsAPI } from '../services/adminApi';
import { ArrowLeft, Search, FileText, Users, ChevronDown, ChevronUp, ShieldCheck, ShieldAlert, ShieldOff } from 'lucide-react';

const RiskBadge = ({ level }) => {
    const config = {
        LOW: { text: 'LOW', cls: 'bg-green-100 text-green-800 border-green-200', Icon: ShieldCheck },
        MEDIUM: { text: 'MEDIUM', cls: 'bg-yellow-100 text-yellow-800 border-yellow-200', Icon: ShieldAlert },
        HIGH: { text: 'HIGH', cls: 'bg-red-100 text-red-800 border-red-200', Icon: ShieldOff },
    }[level] || { text: 'N/A', cls: 'bg-gray-100 text-gray-600 border-gray-200', Icon: ShieldCheck };

    return (
        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${config.cls}`}>
            <config.Icon className="w-3 h-3" />
            {config.text}
        </span>
    );
};

const BehaviorDetail = ({ label, value }) => (
    <div className="flex items-center justify-between py-1.5 border-b border-gray-100 last:border-0">
        <span className="text-xs text-gray-500">{label}</span>
        <span className="text-xs font-semibold text-gray-800">{value}</span>
    </div>
);

const ExamResults = () => {
    const { examId } = useParams();
    const navigate = useNavigate();
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredSubmissions, setFilteredSubmissions] = useState([]);
    const [expandedRow, setExpandedRow] = useState(null);
    const [riskFilter, setRiskFilter] = useState('ALL');

    useEffect(() => { fetchResults(); }, [examId]);

    useEffect(() => {
        if (results?.submissions) {
            const filtered = results.submissions.filter(sub => {
                const matchesSearch = !searchTerm || sub.user_id?.toLowerCase().includes(searchTerm.toLowerCase());
                const matchesRisk = riskFilter === 'ALL' || sub.risk_level === riskFilter;
                return matchesSearch && matchesRisk;
            });
            setFilteredSubmissions(filtered);
        }
    }, [results, searchTerm, riskFilter]);

    const fetchResults = async () => {
        try {
            const response = await analyticsAPI.getExamResults(examId);
            setResults(response.data);
            setFilteredSubmissions(response.data?.submissions || []);
        } catch (error) {
            console.error('Failed to fetch results:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
    );

    if (!results) return (
        <div className="max-w-7xl mx-auto px-4 py-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900">Exam not found</h2>
            <button onClick={() => navigate('/admin/exams')} className="mt-4 text-blue-600 hover:text-blue-800">Return to Exams</button>
        </div>
    );

    const riskCounts = { HIGH: 0, MEDIUM: 0, LOW: 0, None: 0 };
    results.submissions?.forEach(s => {
        if (s.risk_level) riskCounts[s.risk_level] = (riskCounts[s.risk_level] || 0) + 1;
        else riskCounts.None += 1;
    });

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="mb-8">
                <button onClick={() => navigate('/admin/exams')} className="flex items-center text-gray-500 hover:text-gray-700 mb-4 transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to Exams
                </button>
                <h1 className="text-2xl font-bold text-gray-800">{results.exam_title}</h1>
                <p className="text-gray-500 mt-1">Results & Integrity Analysis</p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-3">
                    <Users className="w-8 h-8 text-blue-500 bg-blue-50 p-1.5 rounded-lg" />
                    <div><p className="text-xs text-gray-500">Submissions</p><p className="text-xl font-bold">{results.total_submissions}</p></div>
                </div>
                <div className="bg-red-50 p-4 rounded-xl border border-red-200 shadow-sm flex items-center gap-3">
                    <ShieldOff className="w-8 h-8 text-red-500 bg-red-100 p-1.5 rounded-lg" />
                    <div><p className="text-xs text-red-600">High Risk</p><p className="text-xl font-bold text-red-700">{riskCounts.HIGH || 0}</p></div>
                </div>
                <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-200 shadow-sm flex items-center gap-3">
                    <ShieldAlert className="w-8 h-8 text-yellow-500 bg-yellow-100 p-1.5 rounded-lg" />
                    <div><p className="text-xs text-yellow-600">Medium Risk</p><p className="text-xl font-bold text-yellow-700">{riskCounts.MEDIUM || 0}</p></div>
                </div>
                <div className="bg-green-50 p-4 rounded-xl border border-green-200 shadow-sm flex items-center gap-3">
                    <ShieldCheck className="w-8 h-8 text-green-500 bg-green-100 p-1.5 rounded-lg" />
                    <div><p className="text-xs text-green-600">Low Risk</p><p className="text-xl font-bold text-green-700">{riskCounts.LOW || 0}</p></div>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3 mb-6">
                <div className="relative flex-1 min-w-[200px] max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by Student ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="block w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white"
                    />
                </div>
                <div className="flex gap-2">
                    {['ALL', 'HIGH', 'MEDIUM', 'LOW'].map(r => (
                        <button key={r} onClick={() => setRiskFilter(r)}
                            className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${riskFilter === r ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'}`}>
                            {r}
                        </button>
                    ))}
                </div>
            </div>

            {/* Results Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {filteredSubmissions.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student ID</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Attempt</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Breakdown (MCQ/Code)</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Risk Score</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Risk Level</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted At</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredSubmissions.map((sub) => (
                                    <>
                                        <tr key={sub.id} className={`transition-colors ${expandedRow === sub.id ? 'bg-blue-50/30' : 'hover:bg-gray-50'}`}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-700">{sub.user_id}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{sub.attempt_number || 1}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 py-0.5 inline-flex text-xs font-semibold rounded-full ${sub.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                    {sub.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                                                {sub.score !== null && sub.score !== undefined ? sub.score : '–'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">
                                                <div className="flex flex-col gap-1">
                                                    <span>MCQ: <strong className="text-gray-900">{sub.mcq_score !== undefined && sub.mcq_score !== null ? sub.mcq_score : '–'}</strong></span>
                                                    <span>Code: <strong className="text-gray-900">{sub.coding_score !== undefined && sub.coding_score !== null ? sub.coding_score : '–'}</strong></span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {sub.anomaly_score !== null && sub.anomaly_score !== undefined ? (
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-20 bg-gray-200 rounded-full h-1.5">
                                                            <div className={`h-1.5 rounded-full ${sub.anomaly_score > 60 ? 'bg-red-500' : sub.anomaly_score > 30 ? 'bg-yellow-400' : 'bg-green-500'}`}
                                                                style={{ width: `${sub.anomaly_score}%` }} />
                                                        </div>
                                                        <span className="text-sm font-bold text-gray-900">{sub.anomaly_score}</span>
                                                    </div>
                                                ) : <span className="text-gray-400 text-sm">–</span>}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {sub.risk_level ? <RiskBadge level={sub.risk_level} /> : <span className="text-gray-400 text-xs">No data</span>}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {new Date(sub.submitted_at).toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {sub.behavior ? (
                                                    <button
                                                        onClick={() => setExpandedRow(expandedRow === sub.id ? null : sub.id)}
                                                        className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-800"
                                                    >
                                                        {expandedRow === sub.id ? (<><ChevronUp className="w-3 h-3" /> Hide</>) : (<><ChevronDown className="w-3 h-3" /> View</>)}
                                                    </button>
                                                ) : <span className="text-gray-400 text-xs">–</span>}
                                            </td>
                                        </tr>
                                        {/* Expandable Behavior Row */}
                                        {expandedRow === sub.id && sub.behavior && (
                                            <tr key={`${sub.id}-detail`} className="bg-blue-50/20">
                                                <td colSpan={9} className="px-6 py-4">
                                                    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                                                        <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                                                            <ShieldAlert className="w-4 h-4 text-blue-500" /> Behavioral Biometrics
                                                        </h4>
                                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                                            <div>
                                                                <p className="text-xs font-semibold text-gray-400 uppercase mb-1">Keystroke Activity</p>
                                                                <BehaviorDetail label="Total Keystrokes" value={sub.behavior.keystroke_count} />
                                                                <BehaviorDetail label="Avg Typing Speed" value={`${sub.behavior.avg_typing_speed} k/s`} />
                                                                <BehaviorDetail label="Backspace Ratio" value={`${(sub.behavior.backspace_ratio * 100).toFixed(1)}%`} />
                                                            </div>
                                                            <div>
                                                                <p className="text-xs font-semibold text-gray-400 uppercase mb-1">Paste Events</p>
                                                                <BehaviorDetail label="Paste Count" value={sub.behavior.paste_count} />
                                                                <BehaviorDetail label="Pasted Characters" value={sub.behavior.pasted_chars} />
                                                            </div>
                                                            <div>
                                                                <p className="text-xs font-semibold text-gray-400 uppercase mb-1">Navigation</p>
                                                                <BehaviorDetail label="Tab Switches" value={sub.behavior.tab_switch_count} />
                                                                <BehaviorDetail label="Mouse Clicks" value={sub.behavior.mouse_click_count} />
                                                            </div>
                                                            <div>
                                                                <p className="text-xs font-semibold text-gray-400 uppercase mb-1">Anomaly Signals</p>
                                                                {sub.behavior.tab_switch_count > 3 && <p className="text-xs text-red-600 font-medium">⚠ Excessive tab switching</p>}
                                                                {sub.behavior.paste_count > 0 && <p className="text-xs text-yellow-600 font-medium">⚠ Copy-paste detected</p>}
                                                                {sub.behavior.avg_typing_speed > 9 && <p className="text-xs text-red-600 font-medium">⚠ Unusually fast typing</p>}
                                                                {sub.behavior.tab_switch_count <= 1 && sub.behavior.paste_count === 0 && <p className="text-xs text-green-600 font-medium">✓ No suspicious activity</p>}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="p-12 text-center">
                        <FileText className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                        <h3 className="text-lg font-medium text-gray-900">No submissions found</h3>
                        <p className="mt-1 text-sm text-gray-500">{searchTerm ? 'Try adjusting your search.' : 'No students have submitted this exam yet.'}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ExamResults;
