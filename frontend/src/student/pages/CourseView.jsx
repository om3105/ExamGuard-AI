import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCourseById, getCourseProgress, markLessonComplete, submitCourseQuiz, executeCode } from '../../services/api';

// ── Helper: Extract YouTube embed URL ──
const getYouTubeEmbedUrl = (url) => {
    if (!url) return null;
    const match = url.match(/(?:watch\?v=|youtu\.be\/)([\w-]+)/);
    return match ? `https://www.youtube.com/embed/${match[1]}` : null;
};

// ── Helper: Format duration ──
const formatDuration = (seconds) => {
    if (!seconds) return '';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
};

// ── Quiz Component ──
const QuizSection = ({ quiz, courseId, existingScore, onComplete }) => {
    const [answers, setAnswers] = useState({});
    const [result, setResult] = useState(existingScore != null ? { score: existingScore } : null);
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async () => {
        setSubmitting(true);
        try {
            const res = await submitCourseQuiz(courseId, quiz.id, answers);
            setResult(res);
            onComplete?.(res);
        } catch (e) {
            alert('Failed to submit quiz');
        }
        setSubmitting(false);
    };

    return (
        <div className="bg-white rounded-xl border border-blue-100 p-6 mt-6">
            <h3 className="text-lg font-bold text-blue-900 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg>
                {quiz.title}
            </h3>
            {result ? (
                <div className={`p-4 rounded-lg text-center ${result.score >= 70 ? 'bg-green-50 border border-green-200' : 'bg-amber-50 border border-amber-200'}`}>
                    <p className="text-2xl font-bold">{result.score ?? result.correct}%</p>
                    <p className="text-sm text-gray-600 mt-1">
                        {result.correct !== undefined ? `${result.correct}/${result.total} correct` : 'Completed'}
                    </p>
                </div>
            ) : (
                <>
                    {quiz.questions.map((q, idx) => (
                        <div key={idx} className="mb-5 p-4 bg-gray-50 rounded-lg">
                            <p className="font-medium text-gray-800 mb-3">Q{idx + 1}. {q.question}</p>
                            <div className="space-y-2">
                                {q.options.map((opt, optIdx) => (
                                    <label key={optIdx} className={`flex items-center gap-3 p-2.5 rounded-lg cursor-pointer border transition-colors ${answers[idx] === optIdx ? 'bg-blue-50 border-blue-300' : 'bg-white border-gray-200 hover:bg-gray-50'}`}>
                                        <input type="radio" name={`q-${idx}`} checked={answers[idx] === optIdx} onChange={() => setAnswers(prev => ({ ...prev, [idx]: optIdx }))} className="accent-blue-600" />
                                        <span className="text-sm">{opt}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    ))}
                    <button onClick={handleSubmit} disabled={submitting || Object.keys(answers).length < quiz.questions.length}
                        className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed">
                        {submitting ? 'Submitting...' : 'Submit Quiz'}
                    </button>
                </>
            )}
        </div>
    );
};

// ── Coding Problem Component ──
const CodingSection = ({ problem, courseId }) => {
    const [code, setCode] = useState(problem.starter_code || '');
    const [results, setResults] = useState([]);
    const [running, setRunning] = useState(false);

    const runTestCase = async (tc, index) => {
        try {
            const res = await executeCode(code, problem.language_id, tc.input, tc.expected_output);
            return { index, ...res };
        } catch {
            return { index, passed: false, error: 'Execution failed' };
        }
    };

    const handleRun = async () => {
        setRunning(true);
        setResults([]);
        const testResults = [];
        for (let i = 0; i < problem.test_cases.length; i++) {
            const res = await runTestCase(problem.test_cases[i], i);
            testResults.push(res);
        }
        setResults(testResults);
        setRunning(false);
    };

    return (
        <div className="bg-white rounded-xl border border-green-100 p-6 mt-6">
            <h3 className="text-lg font-bold text-green-900 mb-2 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path></svg>
                {problem.title}
            </h3>
            <p className="text-sm text-gray-600 mb-3">{problem.description}</p>
            {problem.constraints && <p className="text-xs text-gray-500 mb-1"><strong>Constraints:</strong> {problem.constraints}</p>}
            {problem.input_format && <p className="text-xs text-gray-500 mb-1"><strong>Input:</strong> {problem.input_format}</p>}
            {problem.output_format && <p className="text-xs text-gray-500 mb-4"><strong>Output:</strong> {problem.output_format}</p>}

            <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full h-48 p-3 font-mono text-sm bg-gray-900 text-green-400 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                spellCheck="false"
            />

            <button onClick={handleRun} disabled={running}
                className="mt-3 px-6 py-2.5 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50 flex items-center gap-2">
                {running ? (
                    <><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg> Running...</>
                ) : '▶ Run Tests'}
            </button>

            {results.length > 0 && (
                <div className="mt-4 space-y-2">
                    {results.map((r, i) => (
                        <div key={i} className={`p-3 rounded-lg text-sm flex justify-between items-center ${r.passed ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                            <span className="font-medium">Test Case {i + 1}: {r.passed ? '✅ Passed' : '❌ Failed'}</span>
                            {!r.passed && r.actual && <span className="text-xs text-gray-500">Got: "{r.actual}"</span>}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

// ── Main Course Player ──
const CourseView = () => {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const [course, setCourse] = useState(null);
    const [progress, setProgress] = useState(null);
    const [activeModuleIdx, setActiveModuleIdx] = useState(0);
    const [activeLessonIdx, setActiveLessonIdx] = useState(0);
    const [loading, setLoading] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const fetchData = useCallback(async () => {
        try {
            const [courseData, progressData] = await Promise.all([
                getCourseById(courseId),
                getCourseProgress(courseId)
            ]);
            setCourse(courseData);
            setProgress(progressData);
        } catch (err) {
            console.error('Failed to load course:', err);
        }
        setLoading(false);
    }, [courseId]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const currentModule = course?.modules?.[activeModuleIdx];
    const currentLesson = currentModule?.lessons?.[activeLessonIdx];
    const embedUrl = currentLesson ? getYouTubeEmbedUrl(currentLesson.video_url) : null;
    const isLessonComplete = (lessonId) => progress?.completed_lessons?.includes(lessonId);
    const totalLessons = course ? course.modules.reduce((sum, m) => sum + m.lessons.length, 0) : 0;

    const handleMarkComplete = async () => {
        if (!currentLesson) return;
        try {
            const res = await markLessonComplete(courseId, currentLesson.id);
            setProgress(prev => ({
                ...prev,
                completed_lessons: [...(prev?.completed_lessons || []), currentLesson.id],
                progress_percentage: res.progress_percentage
            }));
        } catch (e) {
            console.error('Failed to mark complete:', e);
        }
    };

    const goToNextLesson = () => {
        if (activeLessonIdx < currentModule.lessons.length - 1) {
            setActiveLessonIdx(activeLessonIdx + 1);
        } else if (activeModuleIdx < course.modules.length - 1) {
            setActiveModuleIdx(activeModuleIdx + 1);
            setActiveLessonIdx(0);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center gap-3">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                    <p className="text-gray-500">Loading course...</p>
                </div>
            </div>
        );
    }

    if (!course) {
        return <div className="min-h-screen flex items-center justify-center"><p>Course not found.</p></div>;
    }

    // Enrollment access gate
    if (course.enrollment_status !== 'APPROVED') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-10 max-w-md text-center">
                    <div className={`w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center ${course.enrollment_status === 'PENDING' ? 'bg-amber-100' : course.enrollment_status === 'REJECTED' ? 'bg-red-100' : 'bg-gray-100'
                        }`}>
                        <span className="text-3xl">
                            {course.enrollment_status === 'PENDING' ? '⏳' : course.enrollment_status === 'REJECTED' ? '✗' : '🔒'}
                        </span>
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">
                        {course.enrollment_status === 'PENDING' ? 'Enrollment Pending Approval' :
                            course.enrollment_status === 'REJECTED' ? 'Enrollment Request Rejected' :
                                'Enrollment Required'}
                    </h2>
                    <p className="text-gray-500 text-sm mb-6">
                        {course.enrollment_status === 'PENDING'
                            ? 'Your enrollment request is being reviewed by an administrator. You will get access once approved.'
                            : course.enrollment_status === 'REJECTED'
                                ? 'Your enrollment request was rejected. Please contact the admin or try again from the Learning Hub.'
                                : 'You need to request enrollment to access this course.'}
                    </p>
                    <button onClick={() => navigate('/courses')} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium text-sm">
                        ← Back to Learning Hub
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Header */}
            <header className="bg-white shadow-sm border-b h-14 flex items-center px-4 justify-between z-20 shrink-0">
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate('/courses')} className="text-gray-500 hover:text-gray-800 transition">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
                    </button>
                    <h1 className="font-bold text-gray-800 truncate max-w-xs lg:max-w-md">{course.title}</h1>
                </div>
                <div className="flex items-center gap-4">
                    {/* Progress badge */}
                    <div className="hidden sm:flex items-center gap-2 bg-blue-50 px-3 py-1.5 rounded-full">
                        <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-600 rounded-full transition-all" style={{ width: `${progress?.progress_percentage || 0}%` }}></div>
                        </div>
                        <span className="text-xs font-semibold text-blue-700">{Math.round(progress?.progress_percentage || 0)}%</span>
                    </div>
                    <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden p-2 rounded-lg hover:bg-gray-100">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
                    </button>
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden relative">
                {/* Mobile Backdrop */}
                {sidebarOpen && (
                    <div 
                        className="lg:hidden fixed inset-0 top-14 bg-black/40 z-20" 
                        onClick={() => setSidebarOpen(false)}
                    />
                )}
                
                {/* ── Sidebar ── */}
                <aside className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} fixed lg:static inset-y-14 left-0 z-30 w-80 bg-white border-r border-gray-200 overflow-y-auto transition-transform lg:translate-x-0 shrink-0`}>
                    <div className="p-4">
                        <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Course Content</h2>
                        {course.modules.map((mod, mIdx) => (
                            <div key={mod.id} className="mb-3">
                                <button
                                    onClick={() => { setActiveModuleIdx(mIdx); setActiveLessonIdx(0); }}
                                    className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-semibold transition ${mIdx === activeModuleIdx ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'}`}
                                >
                                    {mod.title}
                                    <span className="block text-xs font-normal text-gray-400 mt-0.5">{mod.lessons.length} lessons</span>
                                </button>
                                {mIdx === activeModuleIdx && (
                                    <div className="ml-3 mt-1 space-y-0.5">
                                        {mod.lessons.map((lesson, lIdx) => (
                                            <button
                                                key={lesson.id}
                                                onClick={() => { setActiveLessonIdx(lIdx); setSidebarOpen(false); }}
                                                className={`w-full text-left px-3 py-2 rounded-md text-xs flex items-center gap-2 transition ${lIdx === activeLessonIdx ? 'bg-blue-100 text-blue-800 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
                                            >
                                                {isLessonComplete(lesson.id) ? (
                                                    <svg className="w-4 h-4 text-green-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                                                ) : (
                                                    <span className="w-4 h-4 rounded-full border-2 border-gray-300 shrink-0"></span>
                                                )}
                                                <span className="truncate">{lesson.title}</span>
                                                {lesson.duration > 0 && <span className="ml-auto text-gray-400 shrink-0">{formatDuration(lesson.duration)}</span>}
                                            </button>
                                        ))}
                                        {/* Show quiz indicator */}
                                        {mod.quizzes?.length > 0 && (
                                            <div className="px-3 py-1.5 text-xs text-blue-500 font-medium flex items-center gap-1.5">
                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg>
                                                Quiz Available
                                            </div>
                                        )}
                                        {/* Show coding indicator */}
                                        {mod.coding_problems?.length > 0 && (
                                            <div className="px-3 py-1.5 text-xs text-green-500 font-medium flex items-center gap-1.5">
                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path></svg>
                                                Coding Challenge
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </aside>

                {/* ── Main Content ── */}
                <main className="flex-1 overflow-y-auto">
                    {/* Video Player */}
                    {embedUrl && (
                        <div className="w-full bg-black">
                            <div className="max-w-5xl mx-auto" style={{ position: 'relative', paddingBottom: '56.25%', height: 0 }}>
                                <iframe
                                    src={embedUrl}
                                    title={currentLesson?.title}
                                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                />
                            </div>
                        </div>
                    )}

                    {/* Lesson Content */}
                    <div className="max-w-5xl mx-auto px-6 py-6">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-xs text-blue-600 font-semibold uppercase tracking-wide">{currentModule?.title}</p>
                                <h2 className="text-2xl font-bold text-gray-900 mt-1">{currentLesson?.title}</h2>
                                {currentLesson?.duration > 0 && (
                                    <p className="text-sm text-gray-500 mt-1">Duration: {formatDuration(currentLesson.duration)}</p>
                                )}
                            </div>
                            <div className="flex gap-2 shrink-0">
                                {!isLessonComplete(currentLesson?.id) ? (
                                    <button onClick={handleMarkComplete}
                                        className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg font-medium hover:bg-green-700 transition flex items-center gap-1.5">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                        Mark Complete
                                    </button>
                                ) : (
                                    <span className="px-4 py-2 bg-green-50 text-green-700 text-sm rounded-lg font-medium border border-green-200 flex items-center gap-1.5">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                                        Completed
                                    </span>
                                )}
                                <button onClick={goToNextLesson}
                                    className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg font-medium hover:bg-blue-700 transition flex items-center gap-1.5">
                                    Next
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                                </button>
                            </div>
                        </div>

                        {/* Show Quizzes for current module at the end of lessons */}
                        {activeLessonIdx === currentModule?.lessons?.length - 1 && currentModule?.quizzes?.map(quiz => (
                            <QuizSection
                                key={quiz.id}
                                quiz={quiz}
                                courseId={courseId}
                                existingScore={progress?.quiz_scores?.[quiz.id]}
                                onComplete={() => fetchData()}
                            />
                        ))}

                        {/* Show Coding Problems for current module at the end of lessons */}
                        {activeLessonIdx === currentModule?.lessons?.length - 1 && currentModule?.coding_problems?.map(problem => (
                            <CodingSection key={problem.id} problem={problem} courseId={courseId} />
                        ))}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default CourseView;
