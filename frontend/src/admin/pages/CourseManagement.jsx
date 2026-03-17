import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { courseAPI } from '../services/adminApi';
import { BookOpen, Plus, FileVideo, FileText, LayoutList, Trash2, Zap, X, Edit } from 'lucide-react';

const CourseManagement = () => {
    const navigate = useNavigate();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [newCourse, setNewCourse] = useState({ title: '', description: '', thumbnail_url: '', modules: [] });

    // Internal state for building the current course
    const [currentModule, setCurrentModule] = useState({ title: '', description: '', lessons: [] });
    const [currentLesson, setCurrentLesson] = useState({ title: '', video_url: '', notes_markdown: '', quiz_id: '' });

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            const resp = await courseAPI.getAll();
            setCourses(resp.data);
        } catch (error) {
            console.error("Failed to load courses", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddLessonToModule = () => {
        if (!currentLesson.title) return;
        setCurrentModule({ ...currentModule, lessons: [...currentModule.lessons, { ...currentLesson }] });
        setCurrentLesson({ title: '', video_url: '', notes_markdown: '', quiz_id: '' });
    };

    const handleAddModuleToCourse = () => {
        if (!currentModule.title) return;
        setNewCourse({ ...newCourse, modules: [...newCourse.modules, { ...currentModule }] });
        setCurrentModule({ title: '', description: '', lessons: [] });
    };

    const handleSaveCourse = async () => {
        try {
            await courseAPI.create(newCourse);
            alert("Course created successfully!");
            setIsCreateModalOpen(false);
            setNewCourse({ title: '', description: '', thumbnail_url: '', modules: [] });
            fetchCourses();
        } catch (error) {
            console.error("Failed to save course", error);
            alert("Failed to save course");
        }
    };

    const handleDeleteCourse = async (id) => {
        if (!window.confirm("Are you sure you want to delete this course?")) return;
        try {
            await courseAPI.delete(id);
            fetchCourses();
        } catch (error) {
            console.error(error);
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500 font-medium animate-pulse">Loading Course Architecture...</div>;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Learning Platform</h1>
                    <p className="text-gray-500 mt-1">Manage all educational modules, videos, and integrated quizzes.</p>
                </div>
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-sm font-medium transition-colors"
                >
                    <Plus className="w-5 h-5" />
                    New Course
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.length === 0 ? (
                    <div className="col-span-full bg-white p-12 text-center rounded-xl shadow-sm border border-gray-200">
                        <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No Courses Found</h3>
                        <p className="text-gray-500 max-w-sm mx-auto">Create a comprehensive bootcamp or crash course by clicking the 'New Course' button.</p>
                    </div>
                ) : (
                    courses.map(course => (
                        <div key={course._id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow group">
                            <div className="h-32 bg-blue-600 p-6 flex items-end">
                                <h3 className="text-xl font-bold text-white">{course.title}</h3>
                            </div>
                            <div className="p-6">
                                <p className="text-sm text-gray-500 mb-4 line-clamp-2">{course.description}</p>
                                <div className="space-y-2 mb-6">
                                    <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
                                        <LayoutList className="w-4 h-4 text-blue-500" />
                                        <span>{course.modules?.length || 0} Modules</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
                                        <FileVideo className="w-4 h-4 text-purple-500" />
                                        <span>{course.modules?.reduce((acc, m) => acc + (m.lessons?.length || 0), 0) || 0} Lessons</span>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                                    <span className="text-xs font-semibold text-gray-400 uppercase">
                                        {course.enrolled_students?.length || 0} Enrolled
                                    </span>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => navigate(`/admin/courses/${course._id}/edit`)}
                                        className="p-1.5 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded transition-colors"
                                        title="Edit Course"
                                    >
                                        <Edit className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteCourse(course._id)}
                                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Course Builder Modal */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
                        <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2"><Zap className="text-yellow-500" /> Course Architect</h2>
                            <button onClick={() => setIsCreateModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X className="w-6 h-6" /></button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-8">
                            {/* Course Metadata */}
                            <section className="bg-blue-50/50 p-4 rounded-lg border border-blue-100">
                                <h3 className="text-lg font-bold text-blue-900 mb-4">Core Information</h3>
                                <div className="grid gap-4">
                                    <input
                                        type="text" placeholder="Course Title (e.g. Master React in 10 Days)"
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
                                        value={newCourse.title} onChange={e => setNewCourse({ ...newCourse, title: e.target.value })}
                                    />
                                    <textarea
                                        placeholder="Course Description" rows="2"
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
                                        value={newCourse.description} onChange={e => setNewCourse({ ...newCourse, description: e.target.value })}
                                    />
                                </div>
                            </section>

                            {/* Existing Modules Tree */}
                            {newCourse.modules.length > 0 && (
                                <section className="space-y-4">
                                    <h3 className="text-lg font-bold text-gray-800 border-b border-gray-200 pb-2">Assembled Modules ({newCourse.modules.length})</h3>
                                    {newCourse.modules.map((mod, idx) => (
                                        <div key={idx} className="bg-white border text-gray-700 border-gray-200 rounded-lg p-4 shadow-sm border-l-4 border-l-green-500">
                                            <h4 className="font-bold text-gray-900">Module {idx + 1}: {mod.title}</h4>
                                            <p className="text-sm text-gray-500 mb-3">{mod.description}</p>
                                            <div className="pl-4 space-y-2 border-l-2 border-gray-100">
                                                {mod.lessons.map((les, lIdx) => (
                                                    <div key={lIdx} className="flex items-center gap-2 text-sm bg-gray-50 p-2 rounded">
                                                        <FileVideo className="w-4 h-4 text-gray-400" />
                                                        <span className="font-medium">{les.title}</span>
                                                        {les.quiz_id && <span className="text-xs bg-blue-100 text-blue-700 px-2 rounded-full font-medium ml-auto border border-blue-200">Attached Quiz</span>}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </section>
                            )}

                            {/* Module & Lesson Builder */}
                            <section className="border border-blue-100 rounded-lg overflow-hidden shadow-sm">
                                <div className="bg-blue-50 px-4 py-3 border-b border-blue-100">
                                    <h3 className="font-semibold text-blue-900 flex items-center gap-2"><Plus className="w-4 h-4" /> Add New Module</h3>
                                </div>
                                <div className="p-4 space-y-4 bg-white">
                                    <div className="grid grid-cols-2 gap-4">
                                        <input
                                            type="text" placeholder="Module Title (e.g. Chapter 1: UI Foundation)"
                                            className="px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
                                            value={currentModule.title} onChange={e => setCurrentModule({ ...currentModule, title: e.target.value })}
                                        />
                                        <input
                                            type="text" placeholder="Module Description"
                                            className="px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
                                            value={currentModule.description} onChange={e => setCurrentModule({ ...currentModule, description: e.target.value })}
                                        />
                                    </div>

                                    {/* Lessons sub-builder */}
                                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mt-4 outline outline-1 outline-gray-200 outline-offset-2">
                                        <h4 className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wider">Inject Lesson into Current Module</h4>
                                        <div className="grid grid-cols-2 gap-3 mb-3">
                                            <input
                                                type="text" placeholder="Lesson Name"
                                                className="px-3 py-2 rounded md:col-span-1 border border-gray-300 text-sm"
                                                value={currentLesson.title} onChange={e => setCurrentLesson({ ...currentLesson, title: e.target.value })}
                                            />
                                            <input
                                                type="text" placeholder="Video URL (YouTube/MP4)"
                                                className="px-3 py-2 rounded md:col-span-1 border border-gray-300 text-sm"
                                                value={currentLesson.video_url} onChange={e => setCurrentLesson({ ...currentLesson, video_url: e.target.value })}
                                            />
                                            <input
                                                type="text" placeholder="Markdown Notes Content"
                                                className="px-3 py-2 rounded md:col-span-1 border border-gray-300 text-sm"
                                                value={currentLesson.notes_markdown} onChange={e => setCurrentLesson({ ...currentLesson, notes_markdown: e.target.value })}
                                            />
                                            <input
                                                type="text" placeholder="Attach Exam ID (Optional)"
                                                className="px-3 py-2 rounded md:col-span-1 border border-gray-300 text-sm"
                                                value={currentLesson.quiz_id} onChange={e => setCurrentLesson({ ...currentLesson, quiz_id: e.target.value })}
                                            />
                                        </div>
                                        <button
                                            onClick={handleAddLessonToModule}
                                            className="text-sm font-bold bg-white text-gray-700 border border-gray-300 hover:bg-gray-100 px-3 py-1.5 rounded transition-colors"
                                        >
                                            Commit Lesson to Module
                                        </button>

                                        {/* Draft Lessons */}
                                        {currentModule.lessons.length > 0 && (
                                            <div className="mt-3 text-xs text-gray-500 flex gap-2 flex-wrap">
                                                {currentModule.lessons.map((l, i) => (
                                                    <span key={i} className="bg-blue-100 text-blue-800 px-2 py-1 rounded font-medium border border-blue-200">
                                                        {l.title}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <button
                                        onClick={handleAddModuleToCourse}
                                        className="w-full font-medium bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors mt-2"
                                    >
                                        Save Module to Course
                                    </button>
                                </div>
                            </section>
                        </div>

                        <div className="p-6 border-t border-gray-200 flex justify-end gap-3 bg-white">
                            <button onClick={() => setIsCreateModalOpen(false)} className="px-5 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 font-medium">
                                Cancel
                            </button>
                            <button onClick={handleSaveCourse} className="px-5 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 font-bold tracking-wide">
                                Deploy Course
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CourseManagement;
