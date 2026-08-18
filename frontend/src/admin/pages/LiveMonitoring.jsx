import React, { useState, useEffect } from 'react';
import adminApi from '../../services/adminApi';
import {
    Activity, ShieldAlert, AlertTriangle, XCircle, Search, RefreshCw,
    Eye, Keyboard, MousePointerClick, Clock, UserCheck, Users, Copy,
    ArrowDownRight, Monitor, ChevronDown, ChevronUp, Info
} from 'lucide-react';
import Modal from '../../components/Modal';

const monitoringAPI = {
    getLiveSessions: () => adminApi.get('/monitoring/live'),
    terminateSession: (id) => adminApi.post(`/monitoring/${id}/terminate`)
};

/**
 * Risk level color mappings for consistent UI.
 */
const riskStyles = {
    LOW: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', dot: 'bg-green-500' },
    MEDIUM: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', dot: 'bg-amber-500' },
    HIGH: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', dot: 'bg-red-500' },
};

const RiskBadge = ({ level, score }) => {
    const style = riskStyles[level] || riskStyles.LOW;
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${style.bg} ${style.text} ${style.border} border`}>
            <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`}></span>
            {score}/100 · {level}
        </span>
    );
};

const LiveMonitoring = () => {
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredSessions, setFilteredSessions] = useState([]);
    const [lastRefresh, setLastRefresh] = useState(new Date());
    const [countdown, setCountdown] = useState(10);
    const [terminateModalOpen, setTerminateModalOpen] = useState(false);
    const [sessionToTerminate, setSessionToTerminate] = useState(null);
    const [viewMode, setViewMode] = useState('cards');
    const [expandedSession, setExpandedSession] = useState(null);

    useEffect(() => {
        fetchLiveSessions();
        const pollInterval = setInterval(() => fetchLiveSessions(), 10000);
        const countdownInterval = setInterval(() => {
            setCountdown(prev => prev > 1 ? prev - 1 : 10);
        }, 1000);
        return () => {
            clearInterval(pollInterval);
            clearInterval(countdownInterval);
        };
    }, []);

    useEffect(() => {
        const filtered = sessions.filter(s =>
            s.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.exam_title.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredSessions(filtered);
    }, [sessions, searchTerm]);

    const fetchLiveSessions = async () => {
        try {
            const response = await monitoringAPI.getLiveSessions();
            setSessions(response.data);
            setLastRefresh(new Date());
        } catch (error) {
            console.error('Failed to fetch live sessions:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleTerminateClick = (session) => {
        setSessionToTerminate(session);
        setTerminateModalOpen(true);
    };

    const confirmTerminate = async () => {
        if (!sessionToTerminate) return;
        try {
            await monitoringAPI.terminateSession(sessionToTerminate.submission_id);
            setSessions(sessions.filter((s) => s.submission_id !== sessionToTerminate.submission_id));
            setTerminateModalOpen(false);
            setSessionToTerminate(null);
        } catch (error) {
            console.error('Failed to terminate session:', error);
            alert('Failed to terminate session');
        }
    };

    const getDuration = (startTimeIso) => {
        const start = new Date(startTimeIso);
        const now = new Date();
        const diffMs = now - start;
        const diffMins = Math.floor(diffMs / 60000);
        if (diffMins < 60) return `${diffMins}m`;
        return `${Math.floor(diffMins / 60)}h ${diffMins % 60}m`;
    };

    const formatEventTime = (timestamp) => {
        try {
            return new Date(timestamp).toLocaleTimeString('en-IN', {
                timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', second: '2-digit'
            });
        } catch { return timestamp; }
    };

    const flaggedCount = sessions.filter(s => (s.risk_level === 'MEDIUM' || s.risk_level === 'HIGH')).length;
    const cleanCount = sessions.length - flaggedCount;

    if (loading && sessions.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-4 sm:px-8 py-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Live Monitoring</h1>
                    <p className="text-gray-500 mt-1">Real-time oversight of active exam sessions</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg border border-gray-200 text-sm">
                        <span className="relative flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                        </span>
                        <span className="text-gray-600">Refreshing in <strong className="text-gray-800">{countdown}s</strong></span>
                    </div>
                    <button
                        onClick={() => { setCountdown(10); fetchLiveSessions(); }}
                        className="flex items-center gap-2 px-4 py-2 border border-gray-200 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Refresh
                    </button>
                </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6">
                {[
                    { label: 'Active Sessions', value: sessions.length, icon: Monitor, color: 'text-blue-600 bg-blue-50' },
                    { label: 'Clean Sessions', value: cleanCount, icon: UserCheck, color: 'text-green-600 bg-green-50' },
                    { label: 'Needs Review', value: flaggedCount, icon: ShieldAlert, color: 'text-red-600 bg-red-50' },
                    { label: 'Last Updated', value: lastRefresh.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', second: '2-digit' }), icon: Clock, color: 'text-orange-600 bg-orange-50' },
                ].map((stat, i) => (
                    <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex items-start justify-between">
                        <div>
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{stat.label}</p>
                            <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                        </div>
                        <div className={`p-2 rounded-lg ${stat.color}`}>
                            <stat.icon className="w-5 h-5" />
                        </div>
                    </div>
                ))}
            </div>

            {/* Admin Disclaimer */}
            <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start gap-2.5">
                <Info className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-blue-700">
                    <strong>Note:</strong> Risk scores indicate review priority, not confirmed misconduct. Browser events can have legitimate causes (e.g., system notifications). Always review evidence before making decisions.
                </p>
            </div>

            {/* Search + View Toggle */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="w-4 h-4 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search by student name or exam..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-lg bg-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>
                <div className="flex items-center bg-white border border-gray-200 rounded-lg p-0.5">
                    <button
                        onClick={() => setViewMode('cards')}
                        className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${viewMode === 'cards' ? 'bg-gray-900 text-white' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Cards
                    </button>
                    <button
                        onClick={() => setViewMode('table')}
                        className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${viewMode === 'table' ? 'bg-gray-900 text-white' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Table
                    </button>
                </div>
            </div>

            {/* Content */}
            {filteredSessions.length > 0 ? (
                viewMode === 'cards' ? (
                    /* ── Card View ── */
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                        {filteredSessions.map((session) => {
                            const isExpanded = expandedSession === session.submission_id;
                            const riskStyle = riskStyles[session.risk_level] || riskStyles.LOW;
                            return (
                                <div key={session.submission_id}
                                    className={`bg-white rounded-xl shadow-sm border overflow-hidden hover:shadow-md transition-shadow ${session.risk_level === 'HIGH' ? 'border-red-200' : session.risk_level === 'MEDIUM' ? 'border-amber-200' : 'border-gray-200'}`}>
                                    {/* Card Header */}
                                    <div className="px-5 py-4 flex justify-between items-start">
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-2">
                                                <h3 className="text-sm font-semibold text-gray-900 truncate">{session.student_name}</h3>
                                                <span className={`flex-shrink-0 w-2 h-2 rounded-full ${riskStyle.dot}`}></span>
                                            </div>
                                            <p className="text-xs text-gray-400 mt-0.5 truncate">{session.exam_title}</p>
                                        </div>
                                        <span className="flex-shrink-0 text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-md flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {getDuration(session.started_at)}
                                        </span>
                                    </div>

                                    {/* Telemetry Grid */}
                                    <div className="px-5 pb-4">
                                        <div className="grid grid-cols-4 gap-2 mb-3">
                                            <div className="bg-gray-50 rounded-lg p-2.5 text-center">
                                                <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-0.5">Keys</p>
                                                <p className="text-sm font-bold text-gray-800">{session.keystroke_count.toLocaleString()}</p>
                                            </div>
                                            <div className="bg-gray-50 rounded-lg p-2.5 text-center">
                                                <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-0.5">Clicks</p>
                                                <p className="text-sm font-bold text-gray-800">{session.mouse_click_count.toLocaleString()}</p>
                                            </div>
                                            <div className={`rounded-lg p-2.5 text-center ${session.tab_switch_count > 0 ? 'bg-amber-50' : 'bg-gray-50'}`}>
                                                <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-0.5">Tabs</p>
                                                <p className={`text-sm font-bold ${session.tab_switch_count > 3 ? 'text-red-600' : session.tab_switch_count > 0 ? 'text-amber-600' : 'text-gray-800'}`}>
                                                    {session.tab_switch_count}
                                                </p>
                                            </div>
                                            <div className={`rounded-lg p-2.5 text-center ${session.paste_count > 0 ? 'bg-orange-50' : 'bg-gray-50'}`}>
                                                <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-0.5">Pastes</p>
                                                <p className={`text-sm font-bold ${session.paste_count > 0 ? 'text-orange-600' : 'text-gray-800'}`}>
                                                    {session.paste_count}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Risk Badge + Factors */}
                                        <div className="mb-3">
                                            <div className="flex items-center justify-between mb-2">
                                                <RiskBadge level={session.risk_level} score={session.risk_score} />
                                                {session.risk_factors?.length > 0 && (
                                                    <button
                                                        onClick={() => setExpandedSession(isExpanded ? null : session.submission_id)}
                                                        className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-0.5"
                                                    >
                                                        Details {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                                                    </button>
                                                )}
                                            </div>

                                            {/* Expandable Risk Details */}
                                            {isExpanded && (
                                                <div className="mt-2 space-y-2">
                                                    {session.risk_factors?.length > 0 && (
                                                        <div className={`p-2.5 rounded-lg ${riskStyle.bg} ${riskStyle.border} border`}>
                                                            <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wider mb-1">Risk Factors</p>
                                                            <ul className="space-y-0.5">
                                                                {session.risk_factors.map((f, i) => (
                                                                    <li key={i} className={`text-xs ${riskStyle.text}`}>• {f}</li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    )}
                                                    {session.recent_events?.length > 0 && (
                                                        <div className="p-2.5 rounded-lg bg-gray-50 border border-gray-100">
                                                            <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wider mb-1">Recent Events</p>
                                                            <div className="space-y-0.5 max-h-32 overflow-y-auto">
                                                                {session.recent_events.map((evt, i) => (
                                                                    <div key={i} className="flex justify-between text-xs">
                                                                        <span className="text-gray-600 font-medium">{evt.type}</span>
                                                                        <span className="text-gray-400">{formatEventTime(evt.timestamp)}</span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Footer */}
                                    <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex justify-end">
                                        <button
                                            onClick={() => handleTerminateClick(session)}
                                            className="text-xs font-medium text-red-600 hover:text-white border border-red-200 hover:bg-red-600 hover:border-red-600 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
                                        >
                                            <XCircle className="w-3.5 h-3.5" /> Terminate
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    /* ── Table View ── */
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-200">
                                        <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Student</th>
                                        <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Exam</th>
                                        <th className="text-center px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Duration</th>
                                        <th className="text-center px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Keys</th>
                                        <th className="text-center px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Tabs</th>
                                        <th className="text-center px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Pastes</th>
                                        <th className="text-center px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Risk</th>
                                        <th className="text-right px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {filteredSessions.map((session) => (
                                        <tr key={session.submission_id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-5 py-3.5 font-medium text-gray-900 whitespace-nowrap">{session.student_name}</td>
                                            <td className="px-5 py-3.5 text-gray-500 max-w-[200px] truncate whitespace-nowrap">{session.exam_title}</td>
                                            <td className="px-5 py-3.5 text-center text-gray-600 whitespace-nowrap">{getDuration(session.started_at)}</td>
                                            <td className="px-5 py-3.5 text-center font-medium text-gray-800 whitespace-nowrap">{session.keystroke_count.toLocaleString()}</td>
                                            <td className="px-5 py-3.5 text-center whitespace-nowrap">
                                                {session.tab_switch_count > 0 ? (
                                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${session.tab_switch_count > 3 ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'}`}>
                                                        {session.tab_switch_count}
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-300">0</span>
                                                )}
                                            </td>
                                            <td className="px-5 py-3.5 text-center whitespace-nowrap">
                                                {session.paste_count > 0 ? (
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-orange-50 text-orange-700">{session.paste_count}</span>
                                                ) : (
                                                    <span className="text-gray-300">0</span>
                                                )}
                                            </td>
                                            <td className="px-5 py-3.5 text-center whitespace-nowrap">
                                                <RiskBadge level={session.risk_level} score={session.risk_score} />
                                            </td>
                                            <td className="px-5 py-3.5 text-right whitespace-nowrap">
                                                <button
                                                    onClick={() => handleTerminateClick(session)}
                                                    className="text-xs font-medium text-red-600 hover:text-red-700 hover:underline transition-colors"
                                                >
                                                    Terminate
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )
            ) : (
                /* ── Empty State ── */
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-16 text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Activity className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-1">No Active Sessions</h3>
                    <p className="text-sm text-gray-500 max-w-sm mx-auto">
                        There are currently no students taking an exam. This page will automatically update when a session begins.
                    </p>
                </div>
            )}

            {/* Terminate Modal */}
            <Modal
                isOpen={terminateModalOpen}
                onClose={() => setTerminateModalOpen(false)}
                title="Terminate Session"
            >
                <div>
                    <div className="flex items-center justify-center mb-5">
                        <div className="bg-red-50 p-3 rounded-full">
                            <AlertTriangle className="w-8 h-8 text-red-500" />
                        </div>
                    </div>
                    <p className="text-center text-gray-800 mb-1 font-semibold">
                        Terminate {sessionToTerminate?.student_name}'s session?
                    </p>
                    <p className="text-center text-sm text-gray-500 mb-6">
                        This will immediately end the student's exam. Their current answers will be saved, but they will not be able to resume. The session will be flagged as <strong className="text-red-600">HIGH</strong> risk.
                    </p>
                    <div className="flex gap-3 justify-end">
                        <button
                            onClick={() => setTerminateModalOpen(false)}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={confirmTerminate}
                            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
                        >
                            Terminate Session
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default LiveMonitoring;
