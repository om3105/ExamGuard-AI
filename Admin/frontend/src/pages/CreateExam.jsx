import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { examAPI } from '../services/adminApi';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';

const CreateExam = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        total_marks: '',
        duration_minutes: '',
        start_time: '',
        sections: []
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const addSection = () => {
        setFormData(prev => ({
            ...prev,
            sections: [...prev.sections, {
                title: '',
                questions: []
            }]
        }));
    };

    const updateSection = (index, field, value) => {
        setFormData(prev => ({
            ...prev,
            sections: prev.sections.map((section, i) =>
                i === index ? { ...section, [field]: value } : section
            )
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
                    ? {
                        ...section,
                        questions: [...section.questions, {
                            question: '',
                            type: 'multiple_choice',
                            options: ['', '', '', ''],
                            correct_answer: '',
                            marks: 1
                        }]
                    }
                    : section
            )
        }));
    };

    const updateQuestion = (sectionIndex, questionIndex, field, value) => {
        setFormData(prev => ({
            ...prev,
            sections: prev.sections.map((section, i) =>
                i === sectionIndex
                    ? {
                        ...section,
                        questions: section.questions.map((question, j) =>
                            j === questionIndex ? { ...question, [field]: value } : question
                        )
                    }
                    : section
            )
        }));
    };

    const removeQuestion = (sectionIndex, questionIndex) => {
        setFormData(prev => ({
            ...prev,
            sections: prev.sections.map((section, i) =>
                i === sectionIndex
                    ? {
                        ...section,
                        questions: section.questions.filter((_, j) => j !== questionIndex)
                    }
                    : section
            )
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

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

            // Convert string values to appropriate types
            const examData = {
                ...formData,
                total_marks: parseInt(formData.total_marks),
                duration_minutes: parseInt(formData.duration_minutes),
                start_time: new Date(formData.start_time),
                sections: normalizedSections
            };

            await examAPI.create(examData);
            navigate('/exams');
        } catch (error) {
            console.error('Failed to create exam:', error);
            alert('Failed to create exam. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <div className="flex items-center gap-4 mb-8">
                <button
                    onClick={() => navigate('/exams')}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
                >
                    <ArrowLeft className="w-5 h-5" />
                    Back to Exams
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-md p-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-8">Create New Exam</h1>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Exam Title *
                            </label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleInputChange}
                                required
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Enter exam title"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Total Marks *
                            </label>
                            <input
                                type="number"
                                name="total_marks"
                                value={formData.total_marks}
                                onChange={handleInputChange}
                                required
                                min="1"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="100"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Duration (minutes) *
                            </label>
                            <input
                                type="number"
                                name="duration_minutes"
                                value={formData.duration_minutes}
                                onChange={handleInputChange}
                                required
                                min="1"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="120"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Start Time *
                            </label>
                            <input
                                type="datetime-local"
                                name="start_time"
                                value={formData.start_time}
                                onChange={handleInputChange}
                                required
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Description
                        </label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            rows="3"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Enter exam description (optional)"
                        />
                    </div>

                    {/* Sections */}
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold text-gray-800">Sections</h2>
                            <button
                                type="button"
                                onClick={addSection}
                                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
                            >
                                <Plus className="w-4 h-4" />
                                Add Section
                            </button>
                        </div>

                        {formData.sections.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                No sections added yet. Click "Add Section" to get started.
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {formData.sections.map((section, sectionIndex) => (
                                    <div key={sectionIndex} className="border border-gray-200 rounded-lg p-6">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex-1 mr-4">
                                                <input
                                                    type="text"
                                                    value={section.title}
                                                    onChange={(e) => updateSection(sectionIndex, 'title', e.target.value)}
                                                    placeholder="Section title"
                                                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                />
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => removeSection(sectionIndex)}
                                                className="text-red-600 hover:text-red-800 p-2"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>

                                        {/* Questions */}
                                        <div className="mb-4">
                                            <div className="flex justify-between items-center mb-2">
                                                <h3 className="font-medium text-gray-700">Questions</h3>
                                                <button
                                                    type="button"
                                                    onClick={() => addQuestion(sectionIndex)}
                                                    className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm"
                                                >
                                                    <Plus className="w-4 h-4" />
                                                    Add Question
                                                </button>
                                            </div>

                                            {section.questions.length === 0 ? (
                                                <p className="text-sm text-gray-500">No questions in this section.</p>
                                            ) : (
                                                <div className="space-y-3">
                                                    {section.questions.map((question, questionIndex) => (
                                                        <div key={questionIndex} className="border border-gray-200 rounded p-4">
                                                            <div className="flex justify-between items-start mb-2">
                                                                <span className="font-medium text-gray-700">
                                                                    Question {questionIndex + 1}
                                                                </span>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => removeQuestion(sectionIndex, questionIndex)}
                                                                    className="text-red-600 hover:text-red-800"
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                </button>
                                                            </div>

                                                            <textarea
                                                                value={question.question}
                                                                onChange={(e) => updateQuestion(sectionIndex, questionIndex, 'question', e.target.value)}
                                                                placeholder="Enter question"
                                                                className="w-full px-3 py-2 border border-gray-300 rounded mb-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                                rows="2"
                                                            />

                                                            <div className="grid grid-cols-2 gap-4 mb-2">
                                                                <select
                                                                    value={question.type}
                                                                    onChange={(e) => updateQuestion(sectionIndex, questionIndex, 'type', e.target.value)}
                                                                    className="px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                                >
                                                                    <option value="multiple_choice">Multiple Choice</option>
                                                                    <option value="code">Code</option>
                                                                </select>

                                                                <input
                                                                    type="number"
                                                                    value={question.marks}
                                                                    onChange={(e) => updateQuestion(sectionIndex, questionIndex, 'marks', parseInt(e.target.value))}
                                                                    placeholder="Marks"
                                                                    min="1"
                                                                    className="px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                                />
                                                            </div>

                                                            {question.type === 'multiple_choice' && (
                                                                <div className="space-y-2">
                                                                    {question.options.map((option, optionIndex) => (
                                                                        <div key={optionIndex} className="flex items-center gap-2">
                                                                            <input
                                                                                type="radio"
                                                                                name={`correct-${sectionIndex}-${questionIndex}`}
                                                                                checked={question.correct_answer === option}
                                                                                onChange={() => updateQuestion(sectionIndex, questionIndex, 'correct_answer', option)}
                                                                            />
                                                                            <input
                                                                                type="text"
                                                                                value={option}
                                                                                onChange={(e) => {
                                                                                    const newOptions = [...question.options];
                                                                                    newOptions[optionIndex] = e.target.value;
                                                                                    updateQuestion(sectionIndex, questionIndex, 'options', newOptions);
                                                                                }}
                                                                                placeholder={`Option ${optionIndex + 1}`}
                                                                                className="flex-1 px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                                            />
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            )}

                                                            {question.type === 'code' && (
                                                                <div className="space-y-2">
                                                                    <textarea
                                                                        value={question.correct_answer}
                                                                        onChange={(e) => updateQuestion(sectionIndex, questionIndex, 'correct_answer', e.target.value)}
                                                                        placeholder="Expected output or test cases"
                                                                        className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                                        rows="3"
                                                                    />
                                                                </div>
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

                    {/* Submit Button */}
                    <div className="flex justify-end gap-4">
                        <button
                            type="button"
                            onClick={() => navigate('/exams')}
                            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Creating...' : 'Create Exam'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateExam;
