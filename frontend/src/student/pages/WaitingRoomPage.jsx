import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const WaitingRoomPage = () => {
    const navigate = useNavigate();
    const { examId } = useParams();
    const [exam, setExam] = useState(null);
    const [timeLeft, setTimeLeft] = useState(null);
    const [canEnter, setCanEnter] = useState(false);
    const [loading, setLoading] = useState(true);
    const [starting, setStarting] = useState(false);

    useEffect(() => {
        const fetchExamDetails = async () => {
            try {
                const { getExamById } = await import('../services/api');
                const data = await getExamById(examId);
                setExam(data);
            } catch (error) {
                console.error("Failed to load exam:", error);
                // navigate('/dashboard'); // Optional: redirect on error
            } finally {
                setLoading(false);
            }
        };

        if (examId) {
            fetchExamDetails();
        }
    }, [examId]);

    useEffect(() => {
        if (!exam) return;

        const timer = setInterval(() => {
            const now = new Date();
            const start = new Date(exam.start_time); // Use real start time from DB
            const difference = start - now;

            if (difference <= 0) {
                clearInterval(timer);
                setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
                setCanEnter(true);
            } else {
                const days = Math.floor(difference / (1000 * 60 * 60 * 24));
                const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
                const minutes = Math.floor((difference / 1000 / 60) % 60);
                const seconds = Math.floor((difference / 1000) % 60);

                setTimeLeft({ days, hours, minutes, seconds });
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [exam]);

    const handleEnterExam = async () => {
        setStarting(true);
        try {
            const { startExam } = await import('../services/api');
            const data = await startExam(examId);
            navigate(`/exam/${examId}`, { state: { submissionId: data.submission_id } });
        } catch (error) {
            console.error('Failed to start exam:', error);
            alert(error.response?.data?.detail || 'Failed to start exam. You may have reached your maximum attempts.');
        } finally {
            setStarting(false);
        }
    };

    if (loading || !timeLeft) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-pulse flex flex-col items-center">
                    <div className="h-4 w-32 bg-gray-200 rounded mb-4"></div>
                    <div className="h-4 w-48 bg-gray-200 rounded"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
            {/* Header */}
            <header className="bg-white shadow-sm border-b border-gray-200 h-16 flex items-center px-8 justify-between">
                <div className="flex items-center gap-3">
                    <img src="/src/assets/logo.png" alt="ExamGuard Logo" className="w-10 h-10 object-contain" />
                    <span className="font-bold text-lg text-gray-800">ExamGuard</span>
                </div>
                <div className="text-sm text-gray-500">
                    Exam ID: <span className="font-mono font-medium text-gray-700">{examId || 'EX-2024-001'}</span>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 flex flex-col items-center justify-center p-6 relative overflow-hidden">
                {/* Background Decoration */}
                <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                    <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-blue-100 rounded-full blur-[100px] opacity-40"></div>
                    <div className="absolute top-[20%] -right-[10%] w-[30%] h-[30%] bg-blue-100 rounded-full blur-[80px] opacity-40"></div>
                </div>

                <div className="relative z-10 w-full max-w-3xl bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    {/* Status Banner */}
                    <div className={`py-3 text-center text-sm font-semibold tracking-wide uppercase ${canEnter ? 'bg-green-600 text-white' : 'bg-blue-600 text-white'}`}>
                        {canEnter ? 'Exam is Live' : 'Waiting Room'}
                    </div>

                    <div className="p-10 flex flex-col items-center">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2 text-center">{exam?.title || 'Loading Exam...'}</h1>
                        <p className="text-gray-500 mb-10 text-center max-w-lg">
                            {exam?.description || 'Please wait for the exam to commence.'}
                        </p>

                        {/* Timer Display */}
                        <div className="grid grid-cols-4 gap-4 mb-12 w-full max-w-lg">
                            {['Days', 'Hours', 'Minutes', 'Seconds'].map((label, index) => {
                                const value = Object.values(timeLeft)[index];
                                return (
                                    <div key={label} className="flex flex-col items-center p-4 bg-gray-50 rounded-xl border border-gray-100 shadow-sm relative overflow-hidden group">
                                        <div className="absolute inset-x-0 top-0 h-1 bg-blue-500 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
                                        <span className="text-4xl font-bold text-gray-900 tabular-nums">
                                            {String(value).padStart(2, '0')}
                                        </span>
                                        <span className="text-xs uppercase tracking-wider text-gray-400 font-semibold mt-1">{label}</span>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Status Message & Action */}
                        <div className="w-full border-t border-gray-100 pt-8 flex flex-col items-center gap-4">
                            {!canEnter ? (
                                <div className="flex items-center gap-3 text-amber-600 bg-amber-50 px-6 py-3 rounded-full border border-amber-100">
                                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    <span className="font-medium">Waiting for start time...</span>
                                </div>
                            ) : (
                                <button
                                    onClick={handleEnterExam}
                                    disabled={starting}
                                    className={`px-10 py-4 font-bold rounded-xl shadow-lg transform transition text-lg flex items-center gap-2 group ${starting ? 'bg-gray-400 text-white cursor-not-allowed scale-100' : 'bg-green-600 hover:bg-green-700 text-white shadow-green-200 hover:-translate-y-0.5 active:translate-y-0'
                                        }`}
                                >
                                    {starting ? (
                                        <>
                                            <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            <span>Starting Session...</span>
                                        </>
                                    ) : (
                                        <>
                                            <span>Enter Exam Now</span>
                                            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path></svg>
                                        </>
                                    )}
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Instructions Footer */}
                    <div className="bg-gray-50 px-10 py-6 border-t border-gray-200">
                        <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-3">Important Instructions</h4>
                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 text-sm text-gray-600">
                            <li className="flex items-center gap-2">
                                <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                Don't switch browser tabs.
                            </li>
                            <li className="flex items-center gap-2">
                                <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                Keep your camera enabled.
                            </li>
                            <li className="flex items-center gap-2">
                                <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                Microphone must be on.
                            </li>
                            <li className="flex items-center gap-2">
                                <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                Stable internet required.
                            </li>
                        </ul>
                    </div>
                </div>

                <p className="mt-8 text-gray-400 text-sm">Session ID: <span className="font-mono">8f92-a1b2-c3d4-e5f6</span> • Protected by ExamGuard AI</p>
            </main>
        </div>
    );
};

export default WaitingRoomPage;
