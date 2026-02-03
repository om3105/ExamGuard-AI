import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getExamById } from '../services/api';
import { submitCode, getSubmissionResult, LANGUAGE_OPTIONS } from '../services/judge0';

const ExamPage = () => {
    const { examId } = useParams();
    const navigate = useNavigate();
    const [exam, setExam] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

    // State for coding question
    const [code, setCode] = useState("");
    const [languageId, setLanguageId] = useState(71); // Default Python
    const [output, setOutput] = useState("");
    const [isRunning, setIsRunning] = useState(false);

    // Answers state [sectionIndex][questionIndex] = answer
    const [answers, setAnswers] = useState({});

    // Modal State
    const [showModal, setShowModal] = useState(false);

    // Question Status Tracking (for color coding)
    const [questionStatus, setQuestionStatus] = useState({});
    // Format: { "0-0": { visited: true, answered: false, markedForReview: false }, ... }

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
            } finally {
                setLoading(false);
            }
        };
        fetchExam();
    }, [examId]);

    // Initialize question status when exam loads
    useEffect(() => {
        if (!exam) return;

        const initialStatus = {};
        exam.sections.forEach((section, sIdx) => {
            section.questions.forEach((_, qIdx) => {
                const key = `${sIdx}-${qIdx}`;
                initialStatus[key] = {
                    visited: sIdx === 0 && qIdx === 0, // Mark first question as visited
                    answered: false,
                    markedForReview: false
                };
            });
        });
        setQuestionStatus(initialStatus);
    }, [exam]);

    // Test Case Results
    const [testCaseResults, setTestCaseResults] = useState([]);

    // Clear output and results when switching questions
    useEffect(() => {
        setOutput("");
        setTestCaseResults([]);
        setCode("");
    }, [currentQuestionIndex, currentSectionIndex]);

    const runTestCase = async (testCase) => {
        try {
            const token = await submitCode(code, languageId, testCase.input);
            return new Promise((resolve, reject) => {
                const interval = setInterval(async () => {
                    try {
                        const result = await getSubmissionResult(token);
                        if (result.status.id >= 3) {
                            clearInterval(interval);

                            // Normalizing output: trim whitespace and newlines for comparison
                            const actualOutput = (result.stdout || "").trim();
                            const expectedOutput = (testCase.output || "").trim();
                            const passed = actualOutput === expectedOutput;

                            resolve({
                                input: testCase.input,
                                expected: testCase.output,
                                actual: actualOutput,
                                passed: passed,
                                status: result.status.description,
                                error: result.stderr || result.compile_output
                            });
                        }
                    } catch (err) {
                        clearInterval(interval);
                        resolve({ passed: false, error: "Execution Failed" });
                    }
                }, 1000);
            });
        } catch (e) {
            return { passed: false, error: "Submission Failed" };
        }
    };

    const handleRunCode = async () => {
        setIsRunning(true);
        setTestCaseResults([]); // Clear previous results

        // If no test cases defined, just run without input or use a default
        if (!currentQuestion.test_cases || currentQuestion.test_cases.length === 0) {
            // Fallback to simple run logic (existing)
            setOutput("Running...");
            // ... existing single run logic could go here if needed, 
            // but let's assume all coding questions have test cases for now 
            // or we just run the first test case as a "Run" action.
            // For this requirements, let's run ALL test cases.
        }

        const results = [];
        for (const testCase of currentQuestion.test_cases || []) {
            const result = await runTestCase(testCase);
            results.push(result);
        }

        setTestCaseResults(results);
        setIsRunning(false);
    };

    // Timer Logic
    const [timeLeft, setTimeLeft] = useState(0);

    useEffect(() => {
        if (!exam) return;

        // Calculate end time: start_time + duration_minutes
        const startTime = new Date(exam.start_time).getTime();
        const durationMs = (exam.duration_minutes || 140) * 60 * 1000;
        const endTime = startTime + durationMs;

        const interval = setInterval(() => {
            const now = new Date().getTime();
            const distance = endTime - now;

            if (distance < 0) {
                clearInterval(interval);
                setTimeLeft(0);
                alert("Time is up! Submitting exam...");
                // Handle auto-submit here
            } else {
                setTimeLeft(distance);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [exam]);

    const formatTime = (ms) => {
        const totalSeconds = Math.floor(ms / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    if (loading) return <div className="p-10 text-center">Loading Exam...</div>;
    if (!exam || !exam.sections || exam.sections.length === 0) return <div className="p-10 text-center">Exam content not found.</div>;

    const currentSection = exam.sections[currentSectionIndex];
    if (!currentSection) return <div>Section not found</div>;

    const currentQuestion = currentSection.questions?.[currentQuestionIndex];
    if (!currentQuestion) return <div className="p-10 text-center">Question not found in this section.</div>;

    const isCoding = currentQuestion.type === 'coding';

    // handleConfirmSubmit - calls backend API and navigates to completion page

    const handleConfirmSubmit = async () => {
        try {
            setShowModal(false);
            // Import submitExam from api service
            const { submitExam } = await import('../services/api');

            // Submit exam to backend
            const response = await submitExam(examId, answers);

            // Store submission details in sessionStorage for completion page
            sessionStorage.setItem('lastSubmissionId', response.submission_id);
            sessionStorage.setItem('lastExamTitle', response.exam_title);
            sessionStorage.setItem('lastSubmittedAt', response.submitted_at);

            // Navigate to test completed page (replace prevents back navigation)
            navigate('/test-completed', { replace: true });
        } catch (error) {
            console.error("Submission failed:", error);
            alert("Failed to submit exam. Please try again.");
            setShowModal(true);  // Re-open modal on error
        }
    };
    const handleNext = () => {
        const section = exam.sections[currentSectionIndex];

        // Check if there are more questions in the current section
        if (currentQuestionIndex < section.questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        } else {
            // Check if there are more sections
            if (currentSectionIndex < exam.sections.length - 1) {
                setCurrentSectionIndex(prev => prev + 1);
                setCurrentQuestionIndex(0);
            } else {
                // End of exam
                setShowModal(true);
            }
        }
    };

    const isLastQuestion = currentSectionIndex === exam.sections.length - 1 &&
        currentQuestionIndex === exam.sections[currentSectionIndex].questions.length - 1;

    return (
        <div className="h-screen flex flex-col bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b px-6 py-4 flex justify-between items-center">
                <h1 className="font-bold text-xl text-gray-800">{exam.title}</h1>
                <div className={`text-sm font-mono px-3 py-1 rounded border ${timeLeft < 300000 ? 'bg-red-50 text-red-600 border-red-100 animate-pulse' : 'bg-gray-100 border-gray-200'}`}>
                    Time Remaining: {formatTime(timeLeft)}
                </div>
            </header>

            <div className="flex-1 flex overflow-hidden">
                {/* Sidebar (Question Palette) */}
                <aside className="w-64 bg-white border-r overflow-y-auto p-4">
                    {exam.sections.map((section, sIdx) => (
                        <div key={sIdx} className="mb-6">
                            <h3 className="text-xs font-bold text-gray-500 uppercase mb-2">{section.title}</h3>
                            <div className="grid grid-cols-4 gap-2">
                                {section.questions?.map((q, qIdx) => (
                                    <button
                                        key={qIdx}
                                        onClick={() => {
                                            setCurrentSectionIndex(sIdx);
                                            setCurrentQuestionIndex(qIdx);
                                        }}
                                        className={`w-10 h-10 rounded text-sm font-medium transition-colors 
                                            ${sIdx === currentSectionIndex && qIdx === currentQuestionIndex
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                                    >
                                        {qIdx + 1}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </aside>

                {/* Main Content */}
                <main className="flex-1 p-6 overflow-y-auto">
                    <div className="max-w-4xl mx-auto">
                        <div className="mb-6">
                            <span className="text-sm text-blue-600 font-bold mb-1 block">Question {currentQuestionIndex + 1}</span>
                            <h2 className="text-xl font-bold text-gray-900">{currentQuestion.text}</h2>
                            {isCoding && (
                                <div className="mt-2 bg-yellow-50 border border-yellow-100 p-4 rounded-lg text-sm text-yellow-800">
                                    <strong>Problem Statement:</strong> {currentQuestion.problem_statement}
                                </div>
                            )}
                        </div>

                        {isCoding ? (
                            /* Judge0 Coding Interface */
                            <div className="flex flex-col gap-4 h-[600px]">
                                <div className="flex justify-between items-center">
                                    <select
                                        value={languageId}
                                        onChange={(e) => setLanguageId(Number(e.target.value))}
                                        className="border rounded p-2 text-sm"
                                    >
                                        {LANGUAGE_OPTIONS.map(lang => (
                                            <option key={lang.id} value={lang.id}>{lang.label}</option>
                                        ))}
                                    </select>
                                    <button
                                        onClick={handleRunCode}
                                        disabled={isRunning}
                                        className={`px-4 py-2 bg-green-600 text-white rounded font-medium text-sm flex items-center gap-2 ${isRunning ? 'opacity-50' : 'hover:bg-green-700'}`}
                                    >
                                        {isRunning ? 'Running...' : 'Run Code'}
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    </button>
                                </div>

                                <textarea
                                    className="flex-1 font-mono text-sm p-4 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none bg-gray-900 text-gray-100"
                                    placeholder="Write your code here..."
                                    value={code}
                                    onChange={(e) => setCode(e.target.value)}
                                    spellCheck="false"
                                />

                                <div className="h-48 bg-gray-900 rounded-lg overflow-y-auto border border-gray-700 flex flex-col">
                                    <div className="bg-gray-800 text-gray-300 text-xs px-4 py-2 border-b border-gray-700 font-bold uppercase tracking-wider">
                                        Test Results
                                    </div>
                                    <div className="p-4 space-y-3">
                                        {testCaseResults.length === 0 && !isRunning && (
                                            <div className="text-gray-500 text-sm font-mono text-center mt-10">Run your code to see results</div>
                                        )}
                                        {isRunning && (
                                            <div className="text-blue-400 text-sm font-mono animate-pulse">Running Test Cases...</div>
                                        )}
                                        {testCaseResults.map((res, i) => (
                                            <div key={i} className={`p-3 rounded border text-sm font-mono ${res.passed ? 'bg-green-900/30 border-green-800' : 'bg-red-900/30 border-red-800'}`}>
                                                <div className="flex justify-between items-center mb-1">
                                                    <span className={`font-bold ${res.passed ? 'text-green-400' : 'text-red-400'}`}>
                                                        {res.passed ? '✅ Passed' : '❌ Failed'}
                                                    </span>
                                                    <span className="text-xs text-gray-500">Test Case {i + 1}</span>
                                                </div>
                                                {!res.passed && (
                                                    <div className="mt-2 text-xs">
                                                        <div className="flex gap-4">
                                                            <div className="flex-1">
                                                                <span className="text-gray-500 block">Input:</span>
                                                                <span className="text-gray-300">{res.input}</span>
                                                            </div>
                                                            <div className="flex-1">
                                                                <span className="text-gray-500 block">Expected:</span>
                                                                <span className="text-green-300">{res.expected}</span>
                                                            </div>
                                                            <div className="flex-1">
                                                                <span className="text-gray-500 block">Actual:</span>
                                                                <span className="text-red-300">{res.actual || res.error || "No Output"}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            /* MCQ Interface */
                            <div className="space-y-3">
                                {currentQuestion.options.map((option, idx) => (
                                    <label key={idx} className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                                        <input
                                            type="radio"
                                            name={`question-${currentQuestionIndex}`}
                                            className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                                            onChange={() => {
                                                const newAnswers = { ...answers };
                                                newAnswers[currentSectionIndex][currentQuestionIndex] = idx;
                                                setAnswers(newAnswers);
                                            }}
                                            checked={answers[currentSectionIndex]?.[currentQuestionIndex] === idx}
                                        />
                                        <span className="ml-3 text-gray-700">{option.text}</span>
                                    </label>
                                ))}
                            </div>
                        )}

                        <div className="mt-8 flex justify-end">
                            <button
                                onClick={handleNext}
                                className="px-6 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                {isLastQuestion ? 'Finish Exam' : 'Next Question'}
                            </button>
                        </div>
                    </div>
                </main>
            </div>
            {/* Confirmation Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-8 max-w-md w-full shadow-2xl transform transition-all scale-100">
                        <div className="text-center">
                            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 mb-4">
                                <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-2">Finish Exam?</h3>
                            <p className="text-sm text-gray-500 mb-6">
                                Are you sure you want to submit your exam? You cannot change your answers after submission.
                            </p>
                            <div className="flex justify-center space-x-4">
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 font-medium transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleConfirmSubmit}
                                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-medium transition-colors"
                                >
                                    Confirm Submit
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
