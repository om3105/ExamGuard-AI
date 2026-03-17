import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { examAPI } from '../services/adminApi';
import { ArrowLeft, Clock, Award, BookOpen, CheckCircle, Code } from 'lucide-react';

const PreviewExam = () => {
    const { examId } = useParams();
    const navigate = useNavigate();
    const [exam, setExam] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeSection, setActiveSection] = useState(0);

    useEffect(() => {
        fetchExam();
    }, [examId]);

    const fetchExam = async () => {
        try {
            const response = await examAPI.getById(examId);
            setExam(response.data);
        } catch (error) {
            console.error('Failed to fetch exam details:', error);
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

    if (!exam) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900">Exam not found</h2>
                    <button
                        onClick={() => navigate('/admin/exams')}
                        className="mt-4 text-blue-600 hover:text-blue-800"
                    >
                        Return to Exams
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="mb-8">
                <button
                    onClick={() => navigate('/admin/exams')}
                    className="flex items-center text-gray-500 hover:text-gray-700 mb-4 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Exams
                </button>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex flex-col md:flex-row justify-between gap-6">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <h1 className="text-2xl font-bold text-gray-800">{exam.title}</h1>
                                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
                                    Preview Mode
                                </span>
                            </div>
                            <p className="text-gray-600">{exam.description || 'No description provided.'}</p>
                        </div>
                        <div className="flex flex-wrap gap-6 text-sm text-gray-500">
                            <div className="flex items-center gap-2">
                                <Clock className="w-5 h-5 text-gray-400" />
                                <div>
                                    <p className="text-xs uppercase font-semibold">Duration</p>
                                    <p className="text-gray-900 font-medium">{exam.duration_minutes} mins</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Award className="w-5 h-5 text-gray-400" />
                                <div>
                                    <p className="text-xs uppercase font-semibold">Total Marks</p>
                                    <p className="text-gray-900 font-medium">{exam.total_marks}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <BookOpen className="w-5 h-5 text-gray-400" />
                                <div>
                                    <p className="text-xs uppercase font-semibold">Sections</p>
                                    <p className="text-gray-900 font-medium">{exam.sections?.length || 0}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Sections Tabs */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden min-h-[500px]">
                <div className="flex border-b border-gray-200 overflow-x-auto">
                    {exam.sections?.map((section, idx) => (
                        <button
                            key={idx}
                            onClick={() => setActiveSection(idx)}
                            className={`px-6 py-4 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${activeSection === idx
                                ? 'border-blue-600 text-blue-600 bg-blue-50/50'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                                }`}
                        >
                            {section.title}
                        </button>
                    ))}
                </div>

                <div className="p-6 md:p-8 bg-gray-50/50 h-full">
                    {exam.sections?.[activeSection] && (
                        <div className="max-w-4xl mx-auto space-y-8">
                            <div className="mb-6">
                                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                    <span className="bg-white px-3 py-1 rounded border border-gray-200 shadow-sm text-sm">
                                        Section {activeSection + 1}
                                    </span>
                                    <span>{exam.sections[activeSection].title}</span>
                                </h3>
                                <p className="text-gray-500 text-sm mt-1 ml-1">
                                    {exam.sections[activeSection].questions?.length || 0} Questions
                                </p>
                            </div>

                            {exam.sections[activeSection].questions?.map((question, qIdx) => (
                                <div key={qIdx} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 relative">
                                    <div className="absolute top-6 right-6">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                                            {question.points} {question.points === 1 ? 'Mark' : 'Marks'}
                                        </span>
                                    </div>

                                    <div className="pr-12">
                                        <h4 className="text-base font-semibold text-gray-900 mb-4 flex gap-3">
                                            <span className="text-gray-400 font-normal">Q{qIdx + 1}.</span>
                                            {question.text}
                                        </h4>

                                        {question.type === 'coding' ? (
                                            <div className="ml-8">
                                                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 mb-4 text-sm font-mono text-gray-700 whitespace-pre-wrap">
                                                    {question.problem_statement}
                                                </div>
                                                {question.constraints && (
                                                    <div className="mb-4">
                                                        <p className="text-xs font-bold text-gray-500 uppercase mb-1">Constraints</p>
                                                        <div className="bg-gray-50 rounded p-3 text-xs font-mono text-gray-600 border border-gray-200">
                                                            {question.constraints}
                                                        </div>
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="text-xs font-bold text-gray-500 uppercase mb-2 flex items-center gap-1">
                                                        <Code className="w-3 h-3" /> Test Cases
                                                    </p>
                                                    <div className="space-y-2">
                                                        {question.test_cases?.map((tc, tIdx) => (
                                                            <div key={tIdx} className="grid grid-cols-2 gap-4 text-xs bg-gray-50 p-2 rounded border border-gray-200">
                                                                <div>
                                                                    <span className="font-semibold text-gray-500">Input:</span>
                                                                    <code className="ml-2 bg-white px-1 py-0.5 rounded border border-gray-200">{tc.input}</code>
                                                                </div>
                                                                <div>
                                                                    <span className="font-semibold text-gray-500">Output:</span>
                                                                    <code className="ml-2 bg-white px-1 py-0.5 rounded border border-gray-200">{tc.output}</code>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="ml-8 space-y-2">
                                                {question.options?.map((option, oIdx) => {
                                                    const isCorrect = option.is_correct; // Provided by backend for admin
                                                    // In case backend doesn't send is_correct for security in student view,
                                                    // for admin view we expect it. If not present, we can't highlight.
                                                    // Checking schema... Admin usually gets full object.

                                                    return (
                                                        <div
                                                            key={oIdx}
                                                            className={`flex items-center p-3 rounded-lg border text-sm transition-colors ${isCorrect
                                                                ? 'bg-green-50 border-green-200 text-green-900'
                                                                : 'bg-white border-gray-200 text-gray-700'
                                                                }`}
                                                        >
                                                            <div className={`w-5 h-5 rounded-full border flex items-center justify-center mr-3 flex-shrink-0 ${isCorrect ? 'border-green-500 bg-green-500 text-white' : 'border-gray-300'
                                                                }`}>
                                                                {isCorrect && <CheckCircle className="w-3 h-3" />}
                                                            </div>
                                                            <span className={isCorrect ? 'font-medium' : ''}>{option.text}</span>
                                                            {isCorrect && (
                                                                <span className="ml-auto text-xs font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded-full uppercase tracking-wider">
                                                                    Correct Answer
                                                                </span>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PreviewExam;
