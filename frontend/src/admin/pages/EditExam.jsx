import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { examAPI } from '../services/adminApi';
import { ArrowLeft, Plus, Trash2, AlertTriangle, Save, Eye } from 'lucide-react';

const EditExam = () => {
    const { examId } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [attemptInfo, setAttemptInfo] = useState({ count: 0, has_in_progress: false, completed: 0 });

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        total_marks: '',
        duration_minutes: '',
        start_time: '',
        sections: []
    });

    useEffect(() => {
        fetchExamData();
    }, [examId]);

    const fetchExamData = async () => {
        try {
            const [examRes, attemptRes] = await Promise.all([
                examAPI.getById(examId),
                examAPI.getAttemptCount(examId)
            ]);
            const exam = examRes.data;
            setAttemptInfo(attemptRes.data);

            // Convert sections back to editable format
            const editableSections = (exam.sections || []).map(section => ({
                title: section.title || '',
                questions: (section.questions || []).map(q => {
                    if (q.type === 'mcq') {
                        const options = (q.options || []).map(o => o.text || o);
                        const correctIdx = q.correct_option_index;
                        return {
                            question: q.text || '',
                            type: 'multiple_choice',
                            options: options.length > 0 ? options : ['', '', '', ''],
                            correct_answer: correctIdx !== null && correctIdx !== undefined && options[correctIdx] ? options[correctIdx] : '',
                            marks: q.points || 1
                        };
                    }
                    return {
                        question: q.text || '',
                        type: 'code',
                        options: ['', '', '', ''],
                        correct_answer: q.problem_statement || '',
                        marks: q.points || 1
                    };
                })
            }));

            // Format datetime for input
            const dt = new Date(exam.start_time);
            const localISO = new Date(dt.getTime() - dt.getTimezoneOffset() * 60000).toISOString().slice(0, 16);

            setFormData({
                title: exam.title || '',
                description: exam.description || '',
                total_marks: exam.total_marks?.toString() || '',
                duration_minutes: exam.duration_minutes?.toString() || '',
                start_time: localISO,
                sections: editableSections
            });
        } catch (err) {
            setError('Failed to load exam data. ' + (err.response?.data?.detail || ''));
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const addSection = () => {
        setFormData(prev => ({
            ...prev,
            sections: [...prev.sections, { title: '', questions: [] }]
        }));
    };

    const updateSection = (index, field, value) => {
        setFormData(prev => ({
            ...prev,
            sections: prev.sections.map((s, i) => i === index ? { ...s, [field]: value } : s)
        }));
    };

    const removeSection = (index) => {
        setFormData(prev => ({
            ...prev,
            sections: prev.sections.filter((_, i) => i !== index)
        }));
    };

    const addQuestion = (sectionIndex) => {
        setFormData(prev => ({
            ...prev,
            sections: prev.sections.map((section, i) =>
                i === sectionIndex
                    ? { ...section, questions: [...section.questions, { question: '', type: 'multiple_choice', options: ['', '', '', ''], correct_answer: '', marks: 1 }] }
                    : section
            )
        }));
    };

    const updateQuestion = (sectionIndex, questionIndex, field, value) => {
        setFormData(prev => ({
            ...prev,
            sections: prev.sections.map((section, i) =>
                i === sectionIndex
                    ? { ...section, questions: section.questions.map((q, j) => j === questionIndex ? { ...q, [field]: value } : q) }
                    : section
            )
        }));
    };

    const removeQuestion = (sectionIndex, questionIndex) => {
        setFormData(prev => ({
            ...prev,
            sections: prev.sections.map((section, i) =>
                i === sectionIndex
                    ? { ...section, questions: section.questions.filter((_, j) => j !== questionIndex) }
                    : section
            )
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        // Validation
        if (!formData.title.trim()) { setError('Exam title is required.'); return; }
        if (!formData.duration_minutes || parseInt(formData.duration_minutes) <= 0) { setError('Duration must be greater than 0.'); return; }
        if (!formData.start_time) { setError('Start time is required.'); return; }

        setSaving(true);
        try {
            const normalizedSections = formData.sections.map((section) => ({
                title: section.title,
                questions: section.questions.map((question) => {
                    if (question.type === 'multiple_choice') {
                        const options = question.options.map((option) => ({
                            text: option,
                            is_correct: option === question.correct_answer
                        }));
                        const correctIndex = question.options.findIndex(
                            (option) => option === question.correct_answer
                        );
                        return {
                            type: 'mcq',
                            text: question.question,
                            points: Number(question.marks) || 1,
                            options,
                            correct_option_index: correctIndex >= 0 ? correctIndex : null
                        };
                    }
                    return {
                        type: 'coding',
                        text: question.question,
                        points: Number(question.marks) || 1,
                        problem_statement: question.correct_answer || question.question,
                        constraints: '',
                        test_cases: []
                    };
                })
            }));

            const examData = {
                ...formData,
                total_marks: parseInt(formData.total_marks),
                duration_minutes: parseInt(formData.duration_minutes),
                start_time: new Date(formData.start_time),
                sections: normalizedSections
            };

            const res = await examAPI.update(examId, examData);
            setSuccess('Exam updated successfully!');
            if (res.data.has_attempts) {
                setSuccess('Exam updated successfully! Note: This exam has existing student attempts.');
            }
            setTimeout(() => setSuccess(''), 5000);
        } catch (err) {
            setError('Failed to update exam. ' + (err.response?.data?.detail || ''));
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="flex flex-col items-center gap-3">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    <p className="text-sm text-gray-500">Loading exam data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <div className="flex items-center gap-4 mb-6">
                <button
                    onClick={() => navigate('/admin/exams')}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-800 font-medium"
                >
                    <ArrowLeft className="w-5 h-5" />
                    Back to Exams
                </button>
            </div>

            {/* Attempt Warning Banner */}
            {attemptInfo.count > 0 && (
                <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
                    <div>
                        <p className="font-semibold text-amber-800">This exam has existing attempts</p>
                        <p className="text-sm text-amber-700 mt-1">
                            <strong>{attemptInfo.count}</strong> total submission(s) — <strong>{attemptInfo.completed}</strong> completed, <strong>{attemptInfo.count - attemptInfo.completed}</strong> in progress.
                            Editing questions may affect grading consistency. Metadata changes (title, duration, dates) are safe.
                        </p>
                    </div>
                </div>
            )}

            {/* Error/Success Toasts */}
            {error && (
                <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
                    <p className="text-sm text-red-700 font-medium">{error}</p>
                </div>
            )}
            {success && (
                <div className="mb-4 bg-green-50 border-l-4 border-green-500 p-4 rounded-md">
                    <p className="text-sm text-green-700 font-medium">{success}</p>
                </div>
            )}

            <div className="bg-white rounded-xl shadow-md p-8">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-bold text-gray-800">Edit Exam</h1>
                    <button
                        onClick={() => navigate(`/admin/exams/${examId}/preview`)}
                        className="flex items-center gap-2 px-4 py-2 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 font-medium text-sm transition-colors"
                    >
                        <Eye className="w-4 h-4" /> Preview
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Exam Title *</label>
                            <input type="text" name="title" value={formData.title} onChange={handleInputChange} required
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Enter exam title" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Total Marks *</label>
                            <input type="number" name="total_marks" value={formData.total_marks} onChange={handleInputChange} required min="1"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="100" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Duration (minutes) *</label>
                            <input type="number" name="duration_minutes" value={formData.duration_minutes} onChange={handleInputChange} required min="1"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="120" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Start Time *</label>
                            <input type="datetime-local" name="start_time" value={formData.start_time} onChange={handleInputChange} required
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                        <textarea name="description" value={formData.description} onChange={handleInputChange} rows="3"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Enter exam description (optional)" />
                    </div>

                    {/* Sections */}
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold text-gray-800">Sections</h2>
                            <button type="button" onClick={addSection}
                                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors">
                                <Plus className="w-4 h-4" /> Add Section
                            </button>
                        </div>

                        {formData.sections.length === 0 ? (
                            <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                                No sections added yet. Click "Add Section" to get started.
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {formData.sections.map((section, sectionIndex) => (
                                    <div key={sectionIndex} className="border border-gray-200 rounded-lg p-6">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex-1 mr-4">
                                                <input type="text" value={section.title}
                                                    onChange={(e) => updateSection(sectionIndex, 'title', e.target.value)}
                                                    placeholder="Section title"
                                                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                                            </div>
                                            <button type="button" onClick={() => removeSection(sectionIndex)} className="text-red-600 hover:text-red-800 p-2">
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>

                                        {/* Questions */}
                                        <div className="mb-4">
                                            <div className="flex justify-between items-center mb-2">
                                                <h3 className="font-medium text-gray-700">Questions ({section.questions.length})</h3>
                                                <button type="button" onClick={() => addQuestion(sectionIndex)}
                                                    className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm">
                                                    <Plus className="w-4 h-4" /> Add Question
                                                </button>
                                            </div>

                                            {section.questions.length === 0 ? (
                                                <p className="text-sm text-gray-500">No questions in this section.</p>
                                            ) : (
                                                <div className="space-y-3">
                                                    {section.questions.map((question, questionIndex) => (
                                                        <div key={questionIndex} className="border border-gray-200 rounded p-4">
                                                            <div className="flex justify-between items-start mb-2">
                                                                <span className="font-medium text-gray-700">Q{questionIndex + 1}</span>
                                                                <button type="button" onClick={() => removeQuestion(sectionIndex, questionIndex)} className="text-red-600 hover:text-red-800">
                                                                    <Trash2 className="w-4 h-4" />
                                                                </button>
                                                            </div>

                                                            <textarea value={question.question}
                                                                onChange={(e) => updateQuestion(sectionIndex, questionIndex, 'question', e.target.value)}
                                                                placeholder="Enter question"
                                                                className="w-full px-3 py-2 border border-gray-300 rounded mb-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent" rows="2" />

                                                            <div className="grid grid-cols-2 gap-4 mb-2">
                                                                <select value={question.type}
                                                                    onChange={(e) => updateQuestion(sectionIndex, questionIndex, 'type', e.target.value)}
                                                                    className="px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                                                                    <option value="multiple_choice">Multiple Choice</option>
                                                                    <option value="code">Code</option>
                                                                </select>
                                                                <input type="number" value={question.marks}
                                                                    onChange={(e) => updateQuestion(sectionIndex, questionIndex, 'marks', parseInt(e.target.value))}
                                                                    placeholder="Marks" min="1"
                                                                    className="px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                                                            </div>

                                                            {question.type === 'multiple_choice' && (
                                                                <div className="space-y-2">
                                                                    {question.options.map((option, optionIndex) => (
                                                                        <div key={optionIndex} className="flex items-center gap-2">
                                                                            <input type="radio" name={`correct-${sectionIndex}-${questionIndex}`}
                                                                                checked={question.correct_answer === option && option !== ''}
                                                                                onChange={() => updateQuestion(sectionIndex, questionIndex, 'correct_answer', option)} />
                                                                            <input type="text" value={option}
                                                                                onChange={(e) => {
                                                                                    const newOptions = [...question.options];
                                                                                    newOptions[optionIndex] = e.target.value;
                                                                                    updateQuestion(sectionIndex, questionIndex, 'options', newOptions);
                                                                                }}
                                                                                placeholder={`Option ${optionIndex + 1}`}
                                                                                className="flex-1 px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            )}

                                                            {question.type === 'code' && (
                                                                <textarea value={question.correct_answer}
                                                                    onChange={(e) => updateQuestion(sectionIndex, questionIndex, 'correct_answer', e.target.value)}
                                                                    placeholder="Problem statement / expected output"
                                                                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent" rows="3" />
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Submit Buttons */}
                    <div className="flex justify-end gap-4 pt-4 border-t border-gray-100">
                        <button type="button" onClick={() => navigate('/admin/exams')}
                            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium">
                            Cancel
                        </button>
                        <button type="submit" disabled={saving}
                            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center gap-2">
                            <Save className="w-4 h-4" />
                            {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditExam;
