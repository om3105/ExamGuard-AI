import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { getExamById } from '../services/api';

// Hooks
import { useExamTimer } from '../hooks/useExamTimer';
import { useQuestionStatus } from '../hooks/useQuestionStatus';
import { useExamNavigation } from '../hooks/useExamNavigation';
import { useExamSubmission } from '../hooks/useExamSubmission';
import { useCodeExecution } from '../hooks/useCodeExecution';
import { useBehaviorLogger } from '../hooks/useProctoringLogger';

// Components
import QuestionPalette from '../components/exam/QuestionPalette';
import StatusLegend from '../components/exam/StatusLegend';
import ActionButtons from '../components/exam/ActionButtons';
import CodeEditor from '../components/exam/CodeEditor';

const ExamPage = () => {
    const { examId } = useParams();
    const location = useLocation();
    const [submissionId, setSubmissionId] = useState(location.state?.submissionId || null);

    const [exam, setExam] = useState(null);
    const [loading, setLoading] = useState(true);
    const [answers, setAnswers] = useState({});
    const [tabViolations, setTabViolations] = useState(0);
    const [showTabWarning, setShowTabWarning] = useState(false);
    const MAX_TAB_VIOLATIONS = 3;

    // Actual user start time (instead of global scheduled time)
    const [actualStartTime, setActualStartTime] = useState(null);

    // Calculate or retrieve actual start time
    useEffect(() => {
        if (exam) {
            const storageKey = `exam_start_${examId}`;
            let storedStart = sessionStorage.getItem(storageKey);
            if (!storedStart) {
                storedStart = new Date().toISOString();
                sessionStorage.setItem(storageKey, storedStart);
            }
            setActualStartTime(storedStart);
        }
    }, [exam, examId]);

    // Hooks Initialization
    const { isSubmitting, submitExam, showSubmitModal, setShowSubmitModal } = useExamSubmission(examId, submissionId);

    // Behavior Logger (runs silently, captures biometric signals)
    const { setCurrentQuestion: logQuestionChange, flushFinal } = useBehaviorLogger(examId, submissionId);

    // Timer Hook with enhanced warning states
    const {
        formattedTime,
        timerState,
        showTimesUpAlert,
        hasShownLowTimeWarning,
        dismissLowTimeWarning
    } = useExamTimer(
        actualStartTime,
        exam?.duration_minutes,
        () => submitExam(answers) // Auto-submit on time up
    );

    // Status Hook
    const { questionStatus, updateQuestionStatus, getQuestionButtonClass, getStatusCounts } = useQuestionStatus(exam);

    // Navigation Hook
    const {
        currentSectionIndex,
        currentQuestionIndex,
        currentSection,
        currentQuestion,
        isLastQuestion,
        navigateToQuestion,
        navigateNext
    } = useExamNavigation(exam, updateQuestionStatus, questionStatus);

    // Track current question for time-on-question logging
    useEffect(() => {
        logQuestionChange(currentSectionIndex, currentQuestionIndex);
    }, [currentSectionIndex, currentQuestionIndex]);

    // Tab Switch Blocking
    useEffect(() => {
        if (!exam) return;

        const handleVisibilityChange = () => {
            if (document.visibilityState === 'hidden') {
                setTabViolations(prev => {
                    const next = prev + 1;
                    if (next >= MAX_TAB_VIOLATIONS) {
                        // Auto-submit on 3rd violation
                        submitExam(answers);
                    }
                    return next;
                });
            } else {
                // Student came back — show warning overlay
                setShowTabWarning(true);
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, [exam, answers]);

    // Code Execution Hook
    const {
        code,
        setCode,
        languageId,
        setLanguageId,
        isExecuting,
        testCaseResults,
        setTestCaseResults,
        runCode,
        clearCode
    } = useCodeExecution();

    // Fetch Exam Data
    useEffect(() => {
        const fetchExam = async () => {
            try {
                const data = await getExamById(examId);
                setExam(data);

                // Initialize answers structure
                const initialAnswers = {};
                data.sections.forEach((section, sIdx) => {
                    initialAnswers[sIdx] = {};
                });
                setAnswers(initialAnswers);
            } catch (error) {
                console.error("Failed to load exam", error);
                if (error.response && error.response.status === 401) {
                    // Redirect to login if unauthorized
                    window.location.href = '/login';
                    return;
                }
                if (error.response && error.response.status === 404) {
                    // Keep exam null to show "Exam not found"
                }
            } finally {
                setLoading(false);
            }
        };

        const initializeSession = async () => {
            // If we don't have a submissionId in React Router state (e.g., page refresh or direct navigation)
            // We attempt to reconnect to an active session.
            if (!submissionId) {
                try {
                    const { startExam } = await import('../services/api');
                    const data = await startExam(examId);
                    setSubmissionId(data.submission_id);
                    fetchExam(); // Fetch the exam content once we hold a valid session
                } catch (error) {
                    console.error("No active session and cannot start a new one", error);
                    alert(error.response?.data?.detail || "You do not have active access to this exam.");
                    window.location.href = `/exam/${examId}/waiting-room`;
                }
            } else {
                fetchExam();
            }
        }

        initializeSession();
    }, [examId, submissionId]);

    // Poll to check if admin terminated session
    useEffect(() => {
        if (!submissionId) return;

        const checkStatus = setInterval(async () => {
            try {
                const { getSubmissionDetails } = await import('../services/api');
                const current = await getSubmissionDetails(submissionId);
                if (current.status === 'TERMINATED') {
                    clearInterval(checkStatus);
                    alert("Your exam session has been terminated by an administrator.");
                    window.location.href = '/dashboard';
                }
            } catch (err) {
                // Silently fail polling on network error
            }
        }, 30000); // Check every 30 seconds

        return () => clearInterval(checkStatus);
    }, [submissionId]);

    // Load or clear code state when switching questions
    useEffect(() => {
        if (currentQuestion?.type !== 'coding') return;
        
        const existingAnswer = answers[currentSectionIndex]?.[currentQuestionIndex];
        if (existingAnswer && existingAnswer.code !== undefined) {
            setCode(existingAnswer.code);
            setTestCaseResults(existingAnswer.results || []);
        } else {
            clearCode();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentQuestionIndex, currentSectionIndex]);

    // Autosave code to answers state whenever it changes
    useEffect(() => {
        if (currentQuestion?.type === 'coding') {
            setAnswers(prev => ({
                ...prev,
                [currentSectionIndex]: {
                    ...prev[currentSectionIndex],
                    [currentQuestionIndex]: {
                        code: code,
                        results: testCaseResults,
                        language_id: languageId
                    }
                }
            }));
        }
    }, [code, testCaseResults, languageId, currentQuestionIndex, currentSectionIndex]);


    // Handlers
    const handleMCQAnswer = (optionIdx) => {
        setAnswers(prev => ({
            ...prev,
            [currentSectionIndex]: {
                ...prev[currentSectionIndex],
                [currentQuestionIndex]: optionIdx
            }
        }));
    };

    const hasAnswer = () => {
        if (!currentQuestion) return false;
        if (currentQuestion.type === 'coding') {
            return code.trim().length > 0;
        }
        return answers[currentSectionIndex]?.[currentQuestionIndex] !== undefined;
    };

    const handleSaveAndNext = () => {
        updateQuestionStatus(currentSectionIndex, currentQuestionIndex, {
            visited: true,
            answered: hasAnswer(),
            markedForReview: questionStatus[`${currentSectionIndex}-${currentQuestionIndex}`]?.markedForReview || false
        });

        if (!isLastQuestion) {
            navigateNext();
        }
    };

    const handleMarkForReviewAndNext = () => {
        updateQuestionStatus(currentSectionIndex, currentQuestionIndex, {
            visited: true,
            answered: hasAnswer(),
            markedForReview: true
        });

        if (!isLastQuestion) {
            navigateNext();
        }
    };

    const handleClearResponse = () => {
        // Clear answer from answers state
        const newAnswers = { ...answers };
        if (newAnswers[currentSectionIndex]) {
            delete newAnswers[currentSectionIndex][currentQuestionIndex];
        }
        setAnswers(newAnswers);

        if (currentQuestion.type === 'coding') {
            clearCode();
        }

        // Update status
        updateQuestionStatus(currentSectionIndex, currentQuestionIndex, {
            visited: true,
            answered: false,
            markedForReview: questionStatus[`${currentSectionIndex}-${currentQuestionIndex}`]?.markedForReview || false
        });
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="text-xl font-semibold text-gray-600">Loading exam...</div></div>;
    if (!exam) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="text-xl font-semibold text-red-600">Exam not found</div></div>;
    if (!currentSection || !currentQuestion) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="text-xl font-semibold text-red-600">Error loading question</div></div>;

    const statusCounts = getStatusCounts();
    const isCoding = currentQuestion.type === 'coding';

    return (
        <div className="h-screen flex flex-col bg-gray-50 font-sans">

            {/* ── Tab Switch Warning Overlay ── */}
            {showTabWarning && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-red-900/95 backdrop-blur-sm">
                    <div className="text-center max-w-md px-8 py-10 bg-white rounded-xl shadow-sm border border-red-500">
                        <div className="text-6xl mb-4">🚨</div>
                        <h2 className="text-2xl font-extrabold text-red-700 mb-2">Tab Switch Detected!</h2>
                        <p className="text-gray-700 mb-4">
                            Switching tabs or leaving the exam window is a violation of exam integrity rules.
                        </p>
                        <div className={`inline-block px-4 py-2 rounded-full font-bold text-sm mb-6 ${tabViolations >= MAX_TAB_VIOLATIONS - 1
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                            }`}>
                            ⚠ Violation {tabViolations} of {MAX_TAB_VIOLATIONS} — {MAX_TAB_VIOLATIONS - tabViolations} remaining before auto-submit
                        </div>
                        <button
                            onClick={() => setShowTabWarning(false)}
                            className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-colors"
                        >
                            I Understand — Return to Exam
                        </button>
                    </div>
                </div>
            )}

            {/* Header */}
            <header className="bg-white border-b px-6 py-3 flex justify-between items-center shadow-sm z-10">
                <div className="flex items-center gap-4">
                    <div className="font-bold text-xl text-gray-800 tracking-tight">{exam.title}</div>
                </div>
                <div className="flex items-center gap-6">
                    <div className={`px-4 py-2 rounded-lg font-mono font-bold text-lg shadow-inner border tracking-wider transition-all duration-300 ${timerState === 'critical' ? 'bg-red-100 text-red-700 border-red-300 animate-pulse' :
                        timerState === 'warning' ? 'bg-yellow-100 text-yellow-700 border-yellow-300' :
                            'bg-gray-100 text-gray-700 border-gray-200'
                        }`}>
                        ⏱ {formattedTime}
                    </div>
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden">
                {/* Left Sidebar - Question Palette */}
                <aside className="w-80 bg-white border-r overflow-y-auto flex-shrink-0 flex flex-col shadow-[2px_0_5px_rgba(0,0,0,0.03)] z-0">
                    <StatusLegend />

                    {/* Status Summary */}
                    <div className="p-4 border-b bg-blue-50/50">
                        <div className="grid grid-cols-2 gap-3 text-xs">
                            <div className="bg-white p-2.5 rounded-lg shadow-sm border border-gray-100 flex flex-col items-center">
                                <div className="font-semibold text-gray-500 mb-1 uppercase tracking-wider text-[10px]">Answered</div>
                                <div className="text-2xl font-bold text-green-600">{statusCounts.answered}</div>
                            </div>
                            <div className="bg-white p-2.5 rounded-lg shadow-sm border border-gray-100 flex flex-col items-center">
                                <div className="font-semibold text-gray-500 mb-1 uppercase tracking-wider text-[10px]">Not Answered</div>
                                <div className="text-2xl font-bold text-red-500">{statusCounts.notAnswered}</div>
                            </div>
                            <div className="bg-white p-2.5 rounded-lg shadow-sm border border-gray-100 flex flex-col items-center">
                                <div className="font-semibold text-gray-500 mb-1 uppercase tracking-wider text-[10px]">Marked</div>
                                <div className="text-2xl font-bold text-yellow-500">{statusCounts.marked}</div>
                            </div>
                            <div className="bg-white p-2.5 rounded-lg shadow-sm border border-gray-100 flex flex-col items-center">
                                <div className="font-semibold text-gray-500 mb-1 uppercase tracking-wider text-[10px]">Not Visited</div>
                                <div className="text-2xl font-bold text-gray-400">{statusCounts.notVisited}</div>
                            </div>
                        </div>
                    </div>

                    <QuestionPalette
                        sections={exam.sections}
                        currentSectionIndex={currentSectionIndex}
                        currentQuestionIndex={currentQuestionIndex}
                        onNavigate={navigateToQuestion}
                        getQuestionButtonClass={getQuestionButtonClass}
                    />
                </aside>

                {/* Main Content Area */}
                <main className="flex-1 overflow-y-auto p-8 bg-gray-50/50">
                    <div className="max-w-5xl mx-auto">
                        {/* Question Header */}
                        <div className="mb-6 pb-4 border-b border-gray-200">
                            <div className="flex items-center justify-between mb-2">
                                <h2 className="text-lg font-bold text-gray-700 uppercase tracking-wide flex items-center gap-2">
                                    <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-sm">{currentSection.title}</span>
                                    <span className="text-gray-400">/</span>
                                    <span>Question {currentQuestionIndex + 1}</span>
                                </h2>
                                <span className="px-3 py-1 bg-gray-100 rounded-full text-xs font-bold text-gray-600 border border-gray-200">
                                    {currentQuestion.points} {currentQuestion.points === 1 ? 'Mark' : 'Marks'}
                                </span>
                            </div>
                        </div>

                        {/* Question Content */}
                        {isCoding ? (
                            <div>
                                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-6">
                                    <h3 className="text-xl font-bold text-gray-900 mb-4 leading-snug">{currentQuestion.text}</h3>
                                    <div className="prose prose-sm max-w-none text-gray-600">
                                        <p className="whitespace-pre-wrap mb-6 leading-relaxed">
                                            {currentQuestion.problem_statement}
                                        </p>
                                        {currentQuestion.constraints && (
                                            <div className="mt-6 bg-gray-50 p-4 rounded-lg border border-gray-100">
                                                <h4 className="font-bold text-gray-800 mb-2 text-xs uppercase tracking-wide">Constraints:</h4>
                                                <p className="text-gray-600 text-sm whitespace-pre-wrap font-mono">
                                                    {currentQuestion.constraints}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <CodeEditor
                                    code={code}
                                    setCode={setCode}
                                    languageId={languageId}
                                    setLanguageId={setLanguageId}
                                    isRunning={isExecuting}
                                    handleRunCode={() => runCode(currentQuestion.test_cases || [])}
                                    testCaseResults={testCaseResults}
                                />
                            </div>
                        ) : (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-6">
                                <h3 className="text-xl font-bold text-gray-900 mb-8 leading-snug">{currentQuestion.text}</h3>
                                <div className="space-y-4">
                                    {currentQuestion.options?.map((option, idx) => (
                                        <label
                                            key={idx}
                                            className={`group flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${answers[currentSectionIndex]?.[currentQuestionIndex] === idx
                                                ? 'border-blue-500 bg-blue-50/50 shadow-sm'
                                                : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                                                }`}
                                        >
                                            <div className="relative flex items-center justify-center">
                                                <input
                                                    type="radio"
                                                    name={`question-${currentQuestionIndex}`}
                                                    checked={answers[currentSectionIndex]?.[currentQuestionIndex] === idx}
                                                    onChange={() => handleMCQAnswer(idx)}
                                                    className="peer h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300"
                                                />
                                            </div>
                                            <span className={`ml-4 text-base transition-colors ${answers[currentSectionIndex]?.[currentQuestionIndex] === idx
                                                ? 'text-blue-900 font-medium'
                                                : 'text-gray-700 group-hover:text-gray-900'
                                                }`}>
                                                {option.text}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        )}

                        <ActionButtons
                            onClearResponse={handleClearResponse}
                            onMarkForReview={handleMarkForReviewAndNext}
                            onSaveAndNext={handleSaveAndNext}
                            onFinish={() => setShowSubmitModal(true)}
                            isLastQuestion={isLastQuestion}
                        />
                    </div>
                </main>
            </div>

            {/* Low Time Warning Popup */}
            {hasShownLowTimeWarning && (
                <div className="fixed top-4 right-4 z-50 animate-slideInRight">
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 shadow-sm rounded-r-lg max-w-md">
                        <div className="flex items-start">
                            <div className="flex-shrink-0">
                                <svg className="h-6 w-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <div className="ml-3 flex-1">
                                <h3 className="text-sm font-bold text-yellow-800">Low Time Warning!</h3>
                                <p className="mt-1 text-sm text-yellow-700">Only 5 minutes remaining. Please manage your time wisely.</p>
                            </div>
                            <button
                                onClick={dismissLowTimeWarning}
                                className="ml-3 flex-shrink-0 text-yellow-400 hover:text-yellow-600 transition-colors"
                            >
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Time's Up Alert */}
            {showTimesUpAlert && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
                    <div className="bg-white rounded-xl p-8 max-w-md w-full shadow-sm border border-red-200">
                        <div className="text-center">
                            <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-red-100 mb-4">
                                <svg className="h-12 w-12 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-bold text-red-600 mb-2">Time's Up!</h3>
                            <p className="text-gray-600 text-lg">Your exam is being submitted automatically...</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Confirmation Modal */}
            {showSubmitModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
                    <div className="bg-white rounded-xl p-8 max-w-md w-full shadow-sm border border-gray-200">
                        <div className="text-center">
                            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-50 mb-6 group-hover:scale-110 transition-transform">
                                <svg className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Finish Exam?</h3>
                            <p className="text-gray-500 mb-8 leading-relaxed">
                                Are you sure you want to submit your exam? <br />
                                <span className="text-sm font-medium text-red-500 bg-red-50 px-2 py-0.5 rounded mt-2 inline-block">You cannot change your answers after submission.</span>
                            </p>
                            <div className="flex justify-center gap-3">
                                <button
                                    onClick={() => setShowSubmitModal(false)}
                                    className="px-5 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors w-full"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => submitExam(answers)}
                                    disabled={isSubmitting}
                                    className={`px-5 py-2.5 bg-blue-600 text-white rounded-lg font-medium transition-all w-full shadow-lg shadow-blue-200 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : 'hover:bg-blue-700 hover:shadow-xl hover:-translate-y-0.5'
                                        }`}
                                >
                                    {isSubmitting ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Submitting...
                                        </span>
                                    ) : 'Confirm Submit'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ExamPage;
