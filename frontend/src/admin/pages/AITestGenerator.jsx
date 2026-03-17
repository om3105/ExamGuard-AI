import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { aiTestAPI } from '../services/adminApi';
import {
    Send, Loader2, ChevronDown, ChevronUp, Trash2,
    Save, Edit3, Check, X, Clock, BookOpen, Code,
    Brain, ArrowLeft, FileText, Settings, Calendar,
    Award, Layers, AlertCircle, CheckCircle2, Upload
} from 'lucide-react';

const DIFFICULTY_OPTIONS = ['easy', 'medium', 'hard'];
const SAMPLE_PROMPTS = [
    { label: 'Python Basics', desc: '5 aptitude, 5 technical MCQs, 2 coding', prompt: 'Create a beginner Python test with 5 aptitude MCQs, 5 technical MCQs, and 2 coding questions' },
    { label: 'Java DSA', desc: 'Intermediate screening test', prompt: 'Generate a Java DSA screening test for intermediate students' },
    { label: 'OOP Concepts', desc: 'Easy aptitude + medium coding', prompt: 'Create an OOPs assessment with easy aptitude and medium coding problems' },
    { label: 'JavaScript Full', desc: '10 MCQs, 3 coding challenges', prompt: 'Build a 90-minute JavaScript test with 10 technical MCQs and 3 coding challenges' },
];

const AITestGenerator = () => {
    const navigate = useNavigate();
    const chatEndRef = useRef(null);
    const [prompt, setPrompt] = useState('');
    const [loading, setLoading] = useState(false);
    const [generatedExam, setGeneratedExam] = useState(null);
    const [parsedPrompt, setParsedPrompt] = useState(null);
    const [chatHistory, setChatHistory] = useState([]);
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);
    const [editingQuestion, setEditingQuestion] = useState(null);
    const [startTime, setStartTime] = useState('');
    const [expandedSections, setExpandedSections] = useState({});
    const [showConfig, setShowConfig] = useState(false);
    const [activeTab, setActiveTab] = useState('prompt'); // 'prompt' | 'preview'

    const [config, setConfig] = useState({
        topic: '',
        difficulty: 'medium',
        language: '',
        aptitude_count: 5,
        technical_count: 5,
        coding_count: 2,
        duration_minutes: 60,
    });

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatHistory]);

    const handleGenerate = async () => {
        if (!prompt.trim() && !config.topic) return;
        setError('');
        setLoading(true);

        setChatHistory(prev => [...prev, { role: 'user', content: prompt || `Generate ${config.topic} test` }]);

        try {
            const payload = { prompt: prompt.trim(), ...config };
            const { data } = await aiTestAPI.generate(payload);

            if (data.success) {
                setGeneratedExam(data.exam);
                setParsedPrompt(data.parsed_prompt);
                const expanded = {};
                data.exam.sections.forEach((_, i) => { expanded[i] = true; });
                setExpandedSections(expanded);
                setActiveTab('preview');

                setChatHistory(prev => [...prev, {
                    role: 'assistant',
                    content: `Generated "${data.exam.title}" — ${data.exam.sections.length} sections, ${data.exam.total_marks} marks.`,
                }]);
            }
        } catch (err) {
            const msg = err.response?.data?.detail || 'Generation failed. Please try again.';
            setError(msg);
            setChatHistory(prev => [...prev, { role: 'assistant', content: msg }]);
        } finally {
            setLoading(false);
            setPrompt('');
        }
    };

    const handleSave = async (publish = false) => {
        if (!generatedExam) return;
        if (!startTime) {
            setError('Please set a start time before saving.');
            return;
        }
        setSaving(true);
        setError('');

        try {
            const { data } = await aiTestAPI.save({
                exam: generatedExam,
                start_time: new Date(startTime).toISOString(),
                publish,
            });
            if (data.success) {
                setTimeout(() => navigate('/admin/exams'), 1200);
            }
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to save exam.');
        } finally {
            setSaving(false);
        }
    };

    const updateQuestion = (sectionIdx, questionIdx, field, value) => {
        setGeneratedExam(prev => {
            const updated = { ...prev };
            updated.sections = updated.sections.map((s, si) => {
                if (si !== sectionIdx) return s;
                return {
                    ...s,
                    questions: s.questions.map((q, qi) => {
                        if (qi !== questionIdx) return q;
                        return { ...q, [field]: value };
                    }),
                };
            });
            return updated;
        });
    };

    const updateOption = (sectionIdx, questionIdx, optionIdx, text) => {
        setGeneratedExam(prev => {
            const updated = { ...prev };
            updated.sections = updated.sections.map((s, si) => {
                if (si !== sectionIdx) return s;
                return {
                    ...s,
                    questions: s.questions.map((q, qi) => {
                        if (qi !== questionIdx) return q;
                        const newOpts = q.options.map((o, oi) =>
                            oi === optionIdx ? { ...o, text } : o
                        );
                        return { ...q, options: newOpts };
                    }),
                };
            });
            return updated;
        });
    };

    const deleteQuestion = (sectionIdx, questionIdx) => {
        setGeneratedExam(prev => {
            const updated = { ...prev };
            updated.sections = updated.sections.map((s, si) => {
                if (si !== sectionIdx) return s;
                return {
                    ...s,
                    questions: s.questions.filter((_, qi) => qi !== questionIdx),
                };
            });
            updated.total_marks = updated.sections.reduce((sum, s) =>
                sum + s.questions.reduce((qs, q) => qs + (q.points || 0), 0), 0
            );
            return updated;
        });
    };

    const updateExamField = (field, value) => {
        setGeneratedExam(prev => ({ ...prev, [field]: value }));
    };

    const totalQuestions = generatedExam
        ? generatedExam.sections.reduce((sum, s) => sum + s.questions.length, 0)
        : 0;

    const getSectionIcon = (title) => {
        if (title.toLowerCase().includes('aptitude')) return <Brain className="w-4 h-4" />;
        if (title.toLowerCase().includes('technical')) return <BookOpen className="w-4 h-4" />;
        if (title.toLowerCase().includes('coding')) return <Code className="w-4 h-4" />;
        return <FileText className="w-4 h-4" />;
    };

    const getSectionColor = (title) => {
        if (title.toLowerCase().includes('aptitude')) return 'text-emerald-600 bg-emerald-50';
        if (title.toLowerCase().includes('technical')) return 'text-blue-600 bg-blue-50';
        if (title.toLowerCase().includes('coding')) return 'text-amber-600 bg-amber-50';
        return 'text-gray-600 bg-gray-50';
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/admin/exams')}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">AI Test Generator</h1>
                        <p className="text-gray-500 mt-1">Generate exam papers from natural language descriptions</p>
                    </div>
                </div>
                {generatedExam && (
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setActiveTab('prompt')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'prompt'
                                ? 'bg-gray-900 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                        >
                            Prompt
                        </button>
                        <button
                            onClick={() => setActiveTab('preview')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'preview'
                                ? 'bg-gray-900 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                        >
                            Preview & Edit
                        </button>
                    </div>
                )}
            </div>

            {/* Error Banner */}
            {error && (
                <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                    <p className="text-sm text-red-700 flex-1">{error}</p>
                    <button onClick={() => setError('')} className="text-red-400 hover:text-red-600">
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}

            {/* Prompt Tab (or no exam generated yet) */}
            {(activeTab === 'prompt' || !generatedExam) && (
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                    {/* Left Column: Input + Templates */}
                    <div className="lg:col-span-3 space-y-6">
                        {/* Prompt Input Card */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                            <div className="px-6 py-4 border-b border-gray-100">
                                <h2 className="font-semibold text-gray-800">Describe your exam</h2>
                                <p className="text-sm text-gray-400 mt-0.5">Enter a detailed description and the system will generate a structured exam paper</p>
                            </div>
                            <div className="p-6">
                                <textarea
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && !loading && (e.preventDefault(), handleGenerate())}
                                    placeholder="e.g. Create a 60-minute Python test for beginners with 5 aptitude questions, 5 technical MCQs on data structures, and 2 coding problems..."
                                    className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none transition"
                                    rows={4}
                                    disabled={loading}
                                />
                                <div className="mt-4 flex items-center justify-between">
                                    <button
                                        onClick={() => setShowConfig(!showConfig)}
                                        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
                                    >
                                        <Settings className="w-4 h-4" />
                                        {showConfig ? 'Hide' : 'Show'} advanced settings
                                    </button>
                                    <button
                                        onClick={handleGenerate}
                                        disabled={loading || (!prompt.trim() && !config.topic)}
                                        className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-sm shadow-sm"
                                    >
                                        {loading ? (
                                            <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</>
                                        ) : (
                                            <><Send className="w-4 h-4" /> Generate Exam</>
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Advanced Config */}
                            {showConfig && (
                                <div className="px-6 pb-6 border-t border-gray-100 pt-5">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5 block">Topic</label>
                                            <input type="text" value={config.topic} onChange={e => setConfig({ ...config, topic: e.target.value })}
                                                placeholder="e.g. Python, DSA, OOPs"
                                                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" />
                                        </div>
                                        <div>
                                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5 block">Language</label>
                                            <input type="text" value={config.language} onChange={e => setConfig({ ...config, language: e.target.value })}
                                                placeholder="e.g. python, java"
                                                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" />
                                        </div>
                                        <div>
                                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5 block">Difficulty</label>
                                            <div className="flex gap-2">
                                                {DIFFICULTY_OPTIONS.map(d => (
                                                    <button key={d} onClick={() => setConfig({ ...config, difficulty: d })}
                                                        className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${config.difficulty === d
                                                            ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                                                        {d.charAt(0).toUpperCase() + d.slice(1)}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5 block">Duration (min)</label>
                                            <input type="number" min="10" max="300" value={config.duration_minutes}
                                                onChange={e => setConfig({ ...config, duration_minutes: parseInt(e.target.value) || 60 })}
                                                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-3 gap-4 mt-4">
                                        {[
                                            { label: 'Aptitude MCQs', key: 'aptitude_count', max: 30 },
                                            { label: 'Technical MCQs', key: 'technical_count', max: 30 },
                                            { label: 'Coding Problems', key: 'coding_count', max: 10 },
                                        ].map(({ label, key, max }) => (
                                            <div key={key}>
                                                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5 block">{label}</label>
                                                <input type="number" min="0" max={max} value={config[key]}
                                                    onChange={e => setConfig({ ...config, [key]: parseInt(e.target.value) || 0 })}
                                                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-center focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Chat History (compact) */}
                        {chatHistory.length > 0 && (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                                <div className="px-6 py-4 border-b border-gray-100">
                                    <h2 className="font-semibold text-gray-800 text-sm">Generation Log</h2>
                                </div>
                                <div className="p-4 max-h-48 overflow-y-auto space-y-2">
                                    {chatHistory.map((msg, i) => (
                                        <div key={i} className={`flex gap-2 items-start text-sm ${msg.role === 'user' ? '' : ''}`}>
                                            <span className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold mt-0.5 ${msg.role === 'user'
                                                ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'}`}>
                                                {msg.role === 'user' ? 'Y' : 'S'}
                                            </span>
                                            <p className="text-gray-700 leading-relaxed">{msg.content}</p>
                                        </div>
                                    ))}
                                    {loading && (
                                        <div className="flex gap-2 items-center text-sm text-gray-400">
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Generating exam structure...
                                        </div>
                                    )}
                                    <div ref={chatEndRef} />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column: Quick Templates + Parsed Info */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Quick Templates */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                            <div className="px-6 py-4 border-b border-gray-100">
                                <h2 className="font-semibold text-gray-800">Quick Templates</h2>
                                <p className="text-sm text-gray-400 mt-0.5">Click to use as starting prompt</p>
                            </div>
                            <div className="p-4 space-y-2">
                                {SAMPLE_PROMPTS.map((sp, i) => (
                                    <button key={i} onClick={() => setPrompt(sp.prompt)}
                                        className="w-full text-left p-3 rounded-lg border border-gray-100 hover:border-blue-200 hover:bg-blue-50/30 transition-colors group">
                                        <p className="text-sm font-medium text-gray-800 group-hover:text-blue-700">{sp.label}</p>
                                        <p className="text-xs text-gray-400 mt-0.5">{sp.desc}</p>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Parsed Prompt */}
                        {parsedPrompt && (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                                <div className="px-6 py-4 border-b border-gray-100">
                                    <h2 className="font-semibold text-gray-800 text-sm">Detected Parameters</h2>
                                </div>
                                <div className="p-4">
                                    <div className="grid grid-cols-2 gap-3">
                                        {[
                                            { label: 'Topic', value: parsedPrompt.topic },
                                            { label: 'Difficulty', value: parsedPrompt.difficulty },
                                            parsedPrompt.language && { label: 'Language', value: parsedPrompt.language },
                                            { label: 'Duration', value: `${parsedPrompt.duration_minutes} min` },
                                        ].filter(Boolean).map((item, i) => (
                                            <div key={i} className="bg-gray-50 rounded-lg p-3">
                                                <p className="text-xs text-gray-400 uppercase tracking-wider">{item.label}</p>
                                                <p className="text-sm font-semibold text-gray-800 mt-0.5 capitalize">{item.value}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Status indicator when no exam */}
                        {!generatedExam && !loading && (
                            <div className="bg-gray-50 rounded-xl border border-dashed border-gray-300 p-8 text-center">
                                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <FileText className="w-6 h-6 text-gray-400" />
                                </div>
                                <h3 className="text-sm font-medium text-gray-600">No exam generated yet</h3>
                                <p className="text-xs text-gray-400 mt-1">Enter a description and click Generate</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Preview Tab - only when exam is generated */}
            {activeTab === 'preview' && generatedExam && (
                <div className="space-y-6">
                    {/* Exam Stats Bar */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { label: 'Total Questions', value: totalQuestions, icon: FileText, color: 'text-blue-600 bg-blue-50' },
                            { label: 'Total Marks', value: generatedExam.total_marks, icon: Award, color: 'text-purple-600 bg-purple-50' },
                            { label: 'Duration', value: `${generatedExam.duration_minutes}m`, icon: Clock, color: 'text-orange-600 bg-orange-50' },
                            { label: 'Sections', value: generatedExam.sections.length, icon: Layers, color: 'text-green-600 bg-green-50' },
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

                    {/* Exam Title & Description (editable) */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <input type="text" value={generatedExam.title}
                            onChange={e => updateExamField('title', e.target.value)}
                            className="w-full text-xl font-bold text-gray-900 border-b-2 border-transparent hover:border-gray-200 focus:border-blue-500 focus:outline-none pb-2 transition bg-transparent" />
                        <textarea value={generatedExam.description}
                            onChange={e => updateExamField('description', e.target.value)}
                            rows={2}
                            className="w-full text-sm text-gray-600 mt-2 border border-transparent hover:border-gray-200 focus:border-blue-500 rounded-lg px-0 py-1 focus:px-3 focus:outline-none resize-none transition bg-transparent" />
                        {generatedExam.tags?.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-3">
                                {generatedExam.tags.map(tag => (
                                    <span key={tag} className="bg-gray-100 text-gray-600 px-2.5 py-1 rounded-md text-xs font-medium">{tag}</span>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Sections */}
                    {generatedExam.sections.map((section, sIdx) => (
                        <div key={sIdx} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            {/* Section Header */}
                            <button onClick={() => setExpandedSections(prev => ({ ...prev, [sIdx]: !prev[sIdx] }))}
                                className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${getSectionColor(section.title)}`}>
                                        {getSectionIcon(section.title)}
                                    </div>
                                    <div className="text-left">
                                        <h3 className="font-semibold text-gray-800">{section.title}</h3>
                                        <p className="text-xs text-gray-400 mt-0.5">{section.questions.length} questions · {section.questions.reduce((s, q) => s + (q.points || 0), 0)} marks</p>
                                    </div>
                                </div>
                                {expandedSections[sIdx] ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                            </button>

                            {/* Section Questions */}
                            {expandedSections[sIdx] && (
                                <div className="border-t border-gray-100">
                                    {section.questions.map((q, qIdx) => {
                                        const isEditing = editingQuestion?.sectionIdx === sIdx && editingQuestion?.questionIdx === qIdx;
                                        return (
                                            <div key={qIdx} className="px-6 py-4 border-b border-gray-50 last:border-0 hover:bg-gray-50/30 group transition-colors">
                                                <div className="flex items-start gap-4">
                                                    {/* Question Number */}
                                                    <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                        <span className="text-xs font-bold text-gray-500">{qIdx + 1}</span>
                                                    </div>

                                                    {/* Question Content */}
                                                    <div className="flex-1 min-w-0">
                                                        {/* Question Text */}
                                                        {isEditing ? (
                                                            <textarea
                                                                value={q.text}
                                                                onChange={e => updateQuestion(sIdx, qIdx, 'text', e.target.value)}
                                                                className="w-full text-sm text-gray-800 border border-blue-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
                                                                rows={2}
                                                            />
                                                        ) : (
                                                            <p className="text-sm text-gray-800 font-medium leading-relaxed">{q.text}</p>
                                                        )}

                                                        {/* MCQ Options */}
                                                        {q.type === 'mcq' && q.options && (
                                                            <div className="mt-3 space-y-1.5">
                                                                {q.options.map((opt, oIdx) => (
                                                                    <div key={oIdx} className={`flex items-center gap-3 text-sm rounded-lg px-3 py-2 ${opt.is_correct ? 'bg-emerald-50 border border-emerald-200' : 'bg-gray-50 border border-transparent'}`}>
                                                                        <span className={`w-6 h-6 flex items-center justify-center rounded-md text-xs font-bold flex-shrink-0 ${opt.is_correct ? 'bg-emerald-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
                                                                            {String.fromCharCode(65 + oIdx)}
                                                                        </span>
                                                                        {isEditing ? (
                                                                            <input type="text" value={opt.text}
                                                                                onChange={e => updateOption(sIdx, qIdx, oIdx, e.target.value)}
                                                                                className="flex-1 border border-gray-200 rounded-md px-2 py-1 text-sm focus:ring-1 focus:ring-blue-400 outline-none" />
                                                                        ) : (
                                                                            <span className={opt.is_correct ? 'text-emerald-700 font-medium' : 'text-gray-600'}>{opt.text}</span>
                                                                        )}
                                                                        {opt.is_correct && <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}

                                                        {/* Coding Problem */}
                                                        {q.type === 'coding' && (
                                                            <div className="mt-3 space-y-2">
                                                                {isEditing ? (
                                                                    <textarea value={q.problem_statement || ''}
                                                                        onChange={e => updateQuestion(sIdx, qIdx, 'problem_statement', e.target.value)}
                                                                        className="w-full text-sm text-gray-600 border border-gray-200 rounded-lg px-3 py-2 focus:ring-1 focus:ring-blue-400 outline-none resize-none font-mono"
                                                                        rows={4} />
                                                                ) : (
                                                                    <pre className="text-sm text-gray-600 bg-gray-50 rounded-lg px-4 py-3 whitespace-pre-wrap font-mono border border-gray-100">{q.problem_statement}</pre>
                                                                )}
                                                                {q.constraints && (
                                                                    <p className="text-xs text-gray-400"><span className="font-medium">Constraints:</span> {q.constraints}</p>
                                                                )}
                                                                {q.test_cases && (
                                                                    <p className="text-xs text-gray-400">
                                                                        <span className="font-medium">Test cases:</span> {q.test_cases.filter(t => !t.is_hidden).length} visible, {q.test_cases.filter(t => t.is_hidden).length} hidden
                                                                    </p>
                                                                )}
                                                            </div>
                                                        )}

                                                        {/* Explanation */}
                                                        {q.explanation && !isEditing && (
                                                            <p className="mt-2 text-xs text-gray-400 italic">Explanation: {q.explanation}</p>
                                                        )}

                                                        {/* Meta */}
                                                        <div className="mt-2 flex items-center gap-2">
                                                            <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-md font-medium">{q.points} pts</span>
                                                            <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-md font-medium capitalize">{q.type}</span>
                                                        </div>
                                                    </div>

                                                    {/* Actions */}
                                                    <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity flex-shrink-0">
                                                        <button onClick={() => setEditingQuestion(isEditing ? null : { sectionIdx: sIdx, questionIdx: qIdx })}
                                                            className={`p-1.5 rounded-lg transition-colors ${isEditing ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100 text-gray-400'}`}
                                                            title={isEditing ? 'Done' : 'Edit'}>
                                                            {isEditing ? <Check className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
                                                        </button>
                                                        <button onClick={() => deleteQuestion(sIdx, qIdx)}
                                                            className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                                                            title="Delete">
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    ))}

                    {/* Schedule & Save */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h3 className="font-semibold text-gray-800 mb-4">Schedule & Save</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
                            <div>
                                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5 block">
                                    <Calendar className="w-3.5 h-3.5 inline mr-1" />Exam Start Time
                                </label>
                                <input type="datetime-local" value={startTime}
                                    onChange={e => setStartTime(e.target.value)}
                                    className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5 block">
                                    <Clock className="w-3.5 h-3.5 inline mr-1" />Duration
                                </label>
                                <div className="flex items-center gap-2">
                                    <input type="number" value={generatedExam.duration_minutes}
                                        onChange={e => updateExamField('duration_minutes', parseInt(e.target.value) || 60)}
                                        className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" />
                                    <span className="text-sm text-gray-400 whitespace-nowrap">minutes</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3">
                            <button onClick={() => handleSave(false)} disabled={saving}
                                className="flex-1 py-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-lg font-medium text-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                Save as Draft
                            </button>
                            <button onClick={() => handleSave(true)} disabled={saving}
                                className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm">
                                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                                Publish Exam
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AITestGenerator;
