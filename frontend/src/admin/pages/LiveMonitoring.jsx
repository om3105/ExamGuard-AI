import React, { useState, useEffect } from 'react';
import adminApi from '../services/adminApi';
import { Activity, ShieldAlert, AlertTriangle, XCircle, Search, RefreshCw, Eye, Keyboard, MousePointerClick, Clock, UserCheck } from 'lucide-react';
import Modal from '../components/Modal';

// API integration mapping
const monitoringAPI = {
    getLiveSessions: () => adminApi.get('/monitoring/live'),
    terminateSession: (id) => adminApi.post(`/monitoring/${id}/terminate`)
};

const LiveMonitoring = () => {
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredSessions, setFilteredSessions] = useState([]);
    const [lastRefresh, setLastRefresh] = useState(new Date());

    // Auto-refresh timer
    const [countdown, setCountdown] = useState(10);

    const [terminateModalOpen, setTerminateModalOpen] = useState(false);
    const [sessionToTerminate, setSessionToTerminate] = useState(null);

    useEffect(() => {
        fetchLiveSessions();

        // Auto refresh every 10 seconds
        const pollInterval = setInterval(() => {
            fetchLiveSessions();
        }, 10000);

        // Countdown timer for UI
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
            alert("Session terminated. The student will be disconnected shortly.");
        } catch (error) {
            console.error('Failed to terminate session:', error);
            alert('Failed to terminate session');
        }
    };

    // Format duration from start time
    const getDuration = (startTimeIso) => {
        const start = new Date(startTimeIso);
        const now = new Date();
        const diffMs = now - start;
        const diffMins = Math.floor(diffMs / 60000);
        return `${diffMins} min`;
    };

    if (loading && sessions.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[500px]">
                <Activity className="w-12 h-12 text-blue-500 animate-pulse mb-4" />
                <p className="text-gray-500 font-medium">Connecting to Live Radar...</p>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 h-[calc(100vh-4rem)] flex flex-col">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <Activity className="w-6 h-6 text-red-500" /> Live Monitoring Radar
                    </h1>
                    <p className="text-gray-500 mt-1">Real-time oversight of active exam sessions</p>
                </div>

                <div className="flex gap-4">
                    {/* Auto-Refresh Indicator */}
                    <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm text-sm">
                        <div className="relative">
                            <span className="block w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
                            <span className="absolute inset-0 block w-full h-full bg-green-400 rounded-full animate-ping opacity-50"></span>
                        </div>
                        <span className="text-gray-600 font-medium">Refreshing in {countdown}s</span>
                    </div>

                    <div className="flex items-center gap-4 bg-gray-900 text-white px-5 py-2 rounded-lg shadow-sm">
                        <Eye className="w-5 h-5 text-blue-400" />
                        <div>
                            <p className="text-xs font-semibold text-gray-400 uppercase">Active Students</p>
                            <p className="text-xl font-bold font-mono leading-none">{sessions.length}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="flex gap-4 mb-6 shrink-0">
                <div className="relative flex-1 max-w-md">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="w-5 h-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search active sessions by student or exam..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                </div>
                <button
                    onClick={() => {
                        setCountdown(10);
                        fetchLiveSessions();
                    }}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                >
                    <RefreshCw className="w-4 h-4 mr-2 text-blue-600" />
                    Force Refresh
                </button>
            </div>

            {/* Active Sessions Grid */}
            <div className="flex-1 overflow-y-auto pb-8">
                {filteredSessions.length > 0 ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                        {filteredSessions.map((session) => (
                            <div key={session.submission_id} className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow flex flex-col">
                                {/* Card Header */}
                                <div className={`px-5 py-3 border-b flex justify-between items-start ${session.live_anomaly_warnings.length > 0 ? 'bg-red-50 border-red-100' : 'bg-green-50/30 border-gray-100'
                                    }`}>
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900 leading-tight">{session.student_name}</h3>
                                        <p className="text-xs text-gray-500 mt-0.5">{session.exam_title}</p>
                                    </div>
                                    <div className="text-right">
                                        <span className="inline-flex bg-white px-2 py-1 rounded text-xs font-mono font-bold text-gray-600 shadow-sm border border-gray-200">
                                            <Clock className="w-3 h-3 inline mr-1 text-blue-500" />
                                            {getDuration(session.started_at)}
                                        </span>
                                    </div>
                                </div>

                                {/* Telemetry Data */}
                                <div className="p-5 flex-1">
                                    <div className="grid grid-cols-2 gap-4 mb-4">
                                        <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                                            <div className="text-xs text-gray-500 mb-1 flex items-center gap-1"><Keyboard className="w-3.5 h-3.5" /> Keystrokes</div>
                                            <div className="text-xl font-bold font-mono text-gray-800">{session.keystroke_count}</div>
                                        </div>
                                        <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                                            <div className="text-xs text-gray-500 mb-1 flex items-center gap-1"><MousePointerClick className="w-3.5 h-3.5" /> Clicks</div>
                                            <div className="text-xl font-bold font-mono text-gray-800">{session.mouse_click_count}</div>
                                        </div>
                                    </div>

                                    {/* Warnings Section */}
                                    <div className="mb-4">
                                        <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Integrity Markers</div>
                                        {session.live_anomaly_warnings.length > 0 ? (
                                            <div className="flex flex-wrap gap-2">
                                                {session.live_anomaly_warnings.map((warn, i) => (
                                                    <span key={i} className="inline-flex items-center px-2 py-1 rounded text-xs font-bold bg-red-100 text-red-800 border border-red-200">
                                                        <ShieldAlert className="w-3 h-3 mr-1" /> {warn}
                                                    </span>
                                                ))}
                                                {session.tab_switch_count > 0 && (
                                                    <span className="inline-flex items-center px-2 py-1 rounded text-xs font-bold bg-yellow-100 text-yellow-800 border border-yellow-200">
                                                        Tabs: {session.tab_switch_count}
                                                    </span>
                                                )}
                                                {session.paste_count > 0 && (
                                                    <span className="inline-flex items-center px-2 py-1 rounded text-xs font-bold bg-orange-100 text-orange-800 border border-orange-200">
                                                        Pastes: {session.paste_count}
                                                    </span>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 p-2 rounded-lg">
                                                <UserCheck className="w-4 h-4" /> Normal Behavior
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Card Footer Actions */}
                                <div className="px-5 py-3 bg-gray-50 border-t border-gray-200 flex justify-end">
                                    <button
                                        onClick={() => handleTerminateClick(session)}
                                        className="text-sm font-bold text-red-600 hover:text-white border border-red-200 hover:bg-red-600 hover:border-transparent px-3 py-1.5 rounded transition-colors flex items-center gap-1"
                                    >
                                        <XCircle className="w-4 h-4" /> Terminate Session
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl">
                        <div className="bg-white p-4 rounded-full shadow-sm mb-4">
                            <ShieldAlert className="w-12 h-12 text-gray-300" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-700">No Active Sessions</h3>
                        <p className="text-gray-500 mt-2 max-w-sm text-center">
                            There are currently no students taking an exam. The radar will automatically update when a session begins.
                        </p>
                    </div>
                )}
            </div>

            {/* Terminate Confirmation Modal */}
            <Modal
                isOpen={terminateModalOpen}
                onClose={() => setTerminateModalOpen(false)}
                title="Force Terminate Session"
            >
                <div>
                    <div className="flex items-center justify-center mb-6">
                        <div className="bg-red-100 p-4 rounded-full">
                            <AlertTriangle className="w-10 h-10 text-red-600" />
                        </div>
                    </div>
                    <p className="text-center text-gray-800 mb-2 font-bold text-lg">
                        Terminate {sessionToTerminate?.student_name}'s exam?
                    </p>
                    <p className="text-center text-gray-500 mb-6 text-sm">
                        This action will immediately kick the student out of the exam environment. Their current answers will be saved, but they will not be allowed to resume. The session will be flagged with a <strong className="text-red-600">HIGH</strong> integrity risk score.
                    </p>
                    <div className="flex gap-3 justify-end">
                        <button
                            onClick={() => setTerminateModalOpen(false)}
                            className="px-5 py-2 text-sm font-bold text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={confirmTerminate}
                            className="px-5 py-2 text-sm font-bold text-white bg-red-600 rounded-lg hover:bg-red-700 shadow-lg shadow-red-200 transition-colors"
                        >
                            Terminate Immediately
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default LiveMonitoring;
