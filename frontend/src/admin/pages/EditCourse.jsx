import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { courseAPI } from '../../services/adminApi';
import { ArrowLeft, Plus, Trash2, Save, FileVideo, BookOpen, GripVertical } from 'lucide-react';

const EditCourse = () => {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        thumbnail_url: '',
        modules: []
    });

    // Builder state for adding new content
    const [newModuleTitle, setNewModuleTitle] = useState('');
    const [newModuleDesc, setNewModuleDesc] = useState('');

    useEffect(() => {
        fetchCourse();
    }, [courseId]);

    const fetchCourse = async () => {
        try {
            const res = await courseAPI.getById(courseId);
            const course = res.data;
            setFormData({
                title: course.title || '',
                description: course.description || '',
                thumbnail_url: course.thumbnail_url || '',
                modules: course.modules || []
            });
        } catch (err) {
            setError('Failed to load course. ' + (err.response?.data?.detail || ''));
        } finally {
            setLoading(false);
        }
    };

    // ─── Module Operations ───
    const addModule = () => {
        if (!newModuleTitle.trim()) return;
        setFormData(prev => ({
            ...prev,
            modules: [...prev.modules, {
                title: newModuleTitle,
                description: newModuleDesc,
                lessons: [],
                quizzes: [],
                coding_problems: []
            }]
        }));
        setNewModuleTitle('');
        setNewModuleDesc('');
    };

    const updateModule = (idx, field, value) => {
        setFormData(prev => ({
            ...prev,
            modules: prev.modules.map((m, i) => i === idx ? { ...m, [field]: value } : m)
        }));
    };

    const removeModule = (idx) => {
        if (!window.confirm(`Remove module "${formData.modules[idx]?.title}"? This will also delete all its lessons.`)) return;
        setFormData(prev => ({
            ...prev,
            modules: prev.modules.filter((_, i) => i !== idx)
        }));
    };

    // ─── Lesson Operations ───
    const addLesson = (moduleIdx) => {
        setFormData(prev => ({
            ...prev,
            modules: prev.modules.map((m, i) =>
                i === moduleIdx
                    ? { ...m, lessons: [...m.lessons, { title: '', video_url: '', notes_markdown: '', quiz_id: '', coding_problem_id: '', duration: 0 }] }
                    : m
            )
        }));
    };

    const updateLesson = (moduleIdx, lessonIdx, field, value) => {
        setFormData(prev => ({
            ...prev,
            modules: prev.modules.map((m, mi) =>
                mi === moduleIdx
                    ? { ...m, lessons: m.lessons.map((l, li) => li === lessonIdx ? { ...l, [field]: value } : l) }
                    : m
            )
        }));
    };

    const removeLesson = (moduleIdx, lessonIdx) => {
        setFormData(prev => ({
            ...prev,
            modules: prev.modules.map((m, mi) =>
                mi === moduleIdx
                    ? { ...m, lessons: m.lessons.filter((_, li) => li !== lessonIdx) }
                    : m
            )
        }));
    };

    // ─── Submit ───
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!formData.title.trim()) { setError('Course title is required.'); return; }
        if (!formData.description.trim()) { setError('Course description is required.'); return; }

        // Validate video URLs
        for (const mod of formData.modules) {
            for (const les of mod.lessons) {
                if (les.video_url && !les.video_url.match(/^https?:\/\/.+/)) {
                    setError(`Invalid video URL in lesson "${les.title}". Must start with http:// or https://`);
                    return;
                }
            }
        }

        setSaving(true);
        try {
            await courseAPI.update(courseId, formData);
            setSuccess('Course updated successfully!');
            setTimeout(() => setSuccess(''), 5000);
        } catch (err) {
            setError('Failed to update course. ' + (err.response?.data?.detail || ''));
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="flex flex-col items-center gap-3">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    <p className="text-sm text-gray-500">Loading course data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-4 sm:px-8 py-8">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
                <button onClick={() => navigate('/admin/courses')}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-800 font-medium">
                    <ArrowLeft className="w-5 h-5" /> Back to Courses
                </button>
            </div>

            {/* Toasts */}
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

            <form onSubmit={handleSubmit}>
                {/* Core Info */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-8 mb-6">
                    <h1 className="text-3xl font-bold text-gray-800 mb-6">Edit Course</h1>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Course Title *</label>
                            <input type="text" value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                required
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="e.g. Master React in 10 Days" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                            <textarea value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                required rows="3"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Course description" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Thumbnail URL</label>
                            <input type="text" value={formData.thumbnail_url}
                                onChange={(e) => setFormData({ ...formData, thumbnail_url: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="https://example.com/image.jpg" />
                        </div>
                    </div>
                </div>

                {/* Modules Editor */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-8 mb-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                            <BookOpen className="w-5 h-5 text-blue-600" /> Modules ({formData.modules.length})
                        </h2>
                    </div>

                    {formData.modules.length === 0 ? (
                        <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                            No modules yet. Add one below.
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {formData.modules.map((module, moduleIdx) => (
                                <div key={moduleIdx} className="border border-gray-200 rounded-xl overflow-hidden">
                                    {/* Module Header */}
                                    <div className="bg-blue-50 p-4 border-b border-gray-200">
                                        <div className="flex items-start gap-3">
                                            <GripVertical className="w-5 h-5 text-gray-300 mt-2 flex-shrink-0" />
                                            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                                                <input type="text" value={module.title}
                                                    onChange={(e) => updateModule(moduleIdx, 'title', e.target.value)}
                                                    placeholder="Module title"
                                                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm font-medium" />
                                                <input type="text" value={module.description || ''}
                                                    onChange={(e) => updateModule(moduleIdx, 'description', e.target.value)}
                                                    placeholder="Module description"
                                                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm" />
                                            </div>
                                            <button type="button" onClick={() => removeModule(moduleIdx)}
                                                className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Lessons */}
                                    <div className="p-4">
                                        <div className="flex justify-between items-center mb-3">
                                            <h4 className="text-sm font-semibold text-gray-600 uppercase tracking-wider flex items-center gap-2">
                                                <FileVideo className="w-4 h-4 text-purple-500" /> Lessons ({module.lessons.length})
                                            </h4>
                                            <button type="button" onClick={() => addLesson(moduleIdx)}
                                                className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1">
                                                <Plus className="w-3 h-3" /> Add Lesson
                                            </button>
                                        </div>

                                        {module.lessons.length === 0 ? (
                                            <p className="text-sm text-gray-400 italic py-2">No lessons in this module.</p>
                                        ) : (
                                            <div className="space-y-3">
                                                {module.lessons.map((lesson, lessonIdx) => (
                                                    <div key={lessonIdx} className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                                                        <div className="flex items-start justify-between mb-2">
                                                            <span className="text-xs font-bold text-gray-400 uppercase">Lesson {lessonIdx + 1}</span>
                                                            <button type="button" onClick={() => removeLesson(moduleIdx, lessonIdx)}
                                                                className="text-red-400 hover:text-red-600">
                                                                <Trash2 className="w-3.5 h-3.5" />
                                                            </button>
                                                        </div>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                            <input type="text" value={lesson.title}
                                                                onChange={(e) => updateLesson(moduleIdx, lessonIdx, 'title', e.target.value)}
                                                                placeholder="Lesson title"
                                                                className="px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500" />
                                                            <input type="text" value={lesson.video_url || ''}
                                                                onChange={(e) => updateLesson(moduleIdx, lessonIdx, 'video_url', e.target.value)}
                                                                placeholder="Video URL (https://...)"
                                                                className="px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500" />
                                                            <input type="text" value={lesson.notes_markdown || ''}
                                                                onChange={(e) => updateLesson(moduleIdx, lessonIdx, 'notes_markdown', e.target.value)}
                                                                placeholder="Markdown notes"
                                                                className="px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500" />
                                                            <input type="text" value={lesson.quiz_id || ''}
                                                                onChange={(e) => updateLesson(moduleIdx, lessonIdx, 'quiz_id', e.target.value)}
                                                                placeholder="Attach Quiz ID (optional)"
                                                                className="px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500" />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Add New Module */}
                    <div className="mt-6 bg-blue-50/50 rounded-xl p-5 border border-blue-100">
                        <h4 className="text-sm font-bold text-blue-900 mb-3 flex items-center gap-2">
                            <Plus className="w-4 h-4" /> Add New Module
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                            <input type="text" value={newModuleTitle}
                                onChange={(e) => setNewModuleTitle(e.target.value)}
                                placeholder="Module title"
                                className="px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 text-sm" />
                            <input type="text" value={newModuleDesc}
                                onChange={(e) => setNewModuleDesc(e.target.value)}
                                placeholder="Module description (optional)"
                                className="px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 text-sm" />
                        </div>
                        <button type="button" onClick={addModule}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium text-sm transition-colors">
                            Add Module
                        </button>
                    </div>
                </div>

                {/* Submit */}
                <div className="flex justify-end gap-4">
                    <button type="button" onClick={() => navigate('/admin/courses')}
                        className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium">
                        Cancel
                    </button>
                    <button type="submit" disabled={saving}
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 font-medium flex items-center gap-2">
                        <Save className="w-4 h-4" />
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EditCourse;
