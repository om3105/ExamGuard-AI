import { useEffect, useState } from 'react';
import { examAPI, studentAPI } from '../services/adminApi';
import { Plus, Edit, Trash2, Eye, Calendar, Clock, FileText, BookOpen, Users, Award, Zap, UserPlus, X, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ExamManagement = () => {
    const [exams, setExams] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // Assignment Modal State
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [selectedExam, setSelectedExam] = useState(null);
    const [allStudents, setAllStudents] = useState([]);
    const [assignedStudents, setAssignedStudents] = useState([]);
    const [maxAttempts, setMaxAttempts] = useState(1);
    const [assignLoading, setAssignLoading] = useState(false);

    useEffect(() => {
        fetchExams();
        fetchAllStudents();
    }, []);

    const fetchAllStudents = async () => {
        try {
            const response = await studentAPI.getAll();
            setAllStudents(response.data);
        } catch (error) {
            console.error('Failed to fetch students:', error);
        }
    };

    const handleAssignClick = async (exam) => {
        setSelectedExam(exam);
        setIsAssignModalOpen(true);
        setAssignLoading(true);
        try {
            const response = await examAPI.getAssignment(exam._id);
            setAssignedStudents(response.data.assigned_students || []);
            setMaxAttempts(response.data.max_attempts || 1);
        } catch (error) {
            console.error('Failed to fetch assignment:', error);
            setAssignedStudents([]);
            setMaxAttempts(1);
        } finally {
            setAssignLoading(false);
        }
    };

    const handleSaveAssignment = async () => {
        try {
            setAssignLoading(true);
            await examAPI.assign(selectedExam._id, {
                assigned_students: assignedStudents,
                max_attempts: maxAttempts
            });
            setIsAssignModalOpen(false);
            alert('Exam assigned successfully!');
        } catch (error) {
            console.error('Failed to save assignment:', error);
            alert('Failed to save assignment');
        } finally {
            setAssignLoading(false);
        }
    };

    const toggleStudentSelection = (studentId) => {
        setAssignedStudents(prev =>
            prev.includes(studentId)
                ? prev.filter(id => id !== studentId)
                : [...prev, studentId]
        );
    };

    const fetchExams = async () => {
        try {
            const response = await examAPI.getAll();
            setExams(response.data);
        } catch (error) {
            console.error('Failed to fetch exams:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this exam?')) return;

        try {
            await examAPI.delete(id);
            setExams(exams.filter((exam) => exam._id !== id));
        } catch (error) {
            console.error('Failed to delete exam:', error);
            alert('Failed to delete exam');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    const StatCard = ({ title, value, icon: Icon, colorClass }) => (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex items-start justify-between">
            <div>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">{title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
            </div>
            <div className={`p-2 rounded-lg ${colorClass}`}>
                <Icon className="w-6 h-6" />
            </div>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Exam Management</h1>
                    <p className="text-gray-500 mt-1">Create and manage your examination system</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate('/admin/ai-test')}
                        className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors shadow-sm font-medium"
                    >
                        <Sparkles className="w-5 h-5" />
                        <span>Create with AI</span>
                    </button>
                    <button
                        onClick={() => navigate('/admin/create-exam')}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm font-medium"
                    >
                        <Plus className="w-5 h-5" />
                        <span>Create New Exam</span>
                    </button>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <StatCard
                    title="Total Exams"
                    value={exams.length}
                    icon={BookOpen}
                    colorClass="bg-blue-100 text-blue-600"
                />
                <StatCard
                    title="Active Exams"
                    value={exams.filter(exam => new Date(exam.start_time) > new Date()).length}
                    icon={Users}
                    colorClass="bg-green-100 text-green-600"
                />
                <StatCard
                    title="Total Marks"
                    value={exams.reduce((sum, exam) => sum + (exam.total_marks || 0), 0)}
                    icon={Award}
                    colorClass="bg-purple-100 text-purple-600"
                />
                <StatCard
                    title="Avg Duration"
                    value={`${exams.length > 0 ? Math.round(exams.reduce((sum, exam) => sum + (exam.duration_minutes || 0), 0) / exams.length) : 0}m`}
                    icon={Clock}
                    colorClass="bg-orange-100 text-orange-600"
                />
            </div>

            {/* Exams Grid */}
            <div className="grid gap-6">
                {exams.length > 0 ? (
                    exams.map((exam) => (
                        <div key={exam._id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                            <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="text-xl font-semibold text-gray-900">
                                            {exam.title}
                                        </h3>
                                        {new Date(exam.start_time) > new Date() ? (
                                            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800 border border-green-200">
                                                Upcoming
                                            </span>
                                        ) : (
                                            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-800 border border-gray-200">
                                                Past
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-gray-600 mb-4">{exam.description || 'No description provided.'}</p>

                                    <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-4 h-4" />
                                            <span>
                                                {new Date(exam.start_time).toLocaleDateString('en-US', {
                                                    weekday: 'short',
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric'
                                                })}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Clock className="w-4 h-4" />
                                            <span>{exam.duration_minutes} minutes</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Award className="w-4 h-4" />
                                            <span>{exam.total_marks} marks</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <BookOpen className="w-4 h-4" />
                                            <span>{exam.sections?.length || 0} sections</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => handleAssignClick(exam)}
                                        className="p-2 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors border border-gray-200"
                                        title="Assign Exam"
                                    >
                                        <UserPlus className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => navigate(`/admin/exams/${exam._id}/edit`)}
                                        className="p-2 text-gray-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors border border-gray-200"
                                        title="Edit Exam"
                                    >
                                        <Edit className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => navigate(`/admin/exams/${exam._id}/preview`)}
                                        className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-gray-200"
                                        title="Preview Exam Content"
                                    >
                                        <Eye className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => navigate(`/admin/exams/${exam._id}/results`)}
                                        className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors border border-gray-200"
                                        title="View Results"
                                    >
                                        <Award className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(exam._id)}
                                        className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-gray-200"
                                        title="Delete Exam"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <FileText className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No exams created yet</h3>
                        <p className="text-gray-500 mb-6 max-w-sm mx-auto">
                            Start building your examination system by creating your first exam.
                        </p>
                        <button
                            onClick={() => navigate('/admin/create-exam')}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm font-medium"
                        >
                            <Zap className="w-4 h-4" />
                            <span>Create Your First Exam</span>
                        </button>
                    </div>
                )}
            </div>

            {/* Assignment Modal */}
            {isAssignModalOpen && selectedExam && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-gray-900">Assign Exam: {selectedExam.title}</h2>
                            <button onClick={() => setIsAssignModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto flex-1">
                            {assignLoading ? (
                                <div className="flex justify-center py-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Max Attempts Permitted (0 = Unlimited)
                                        </label>
                                        <input
                                            type="number"
                                            value={maxAttempts}
                                            onChange={(e) => setMaxAttempts(parseInt(e.target.value) || 0)}
                                            className="w-full sm:w-1/3 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            min="0"
                                        />
                                    </div>

                                    <div>
                                        <div className="flex justify-between items-center mb-2">
                                            <label className="block text-sm font-medium text-gray-700">
                                                Select Students to Assign
                                            </label>
                                            <span className="text-sm text-blue-600 font-medium bg-blue-50 px-2 py-1 rounded-md">
                                                {assignedStudents.length} Selected
                                            </span>
                                        </div>

                                        <div className="border border-gray-200 rounded-lg max-h-64 overflow-y-auto bg-gray-50 p-2">
                                            {allStudents.length === 0 ? (
                                                <p className="p-4 text-center text-gray-500">No students found.</p>
                                            ) : (
                                                <div className="space-y-1">
                                                    {allStudents.map(student => (
                                                        <label
                                                            key={student._id || student.id}
                                                            className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors ${assignedStudents.includes(student._id || student.id)
                                                                ? 'bg-blue-100 border border-blue-200'
                                                                : 'hover:bg-gray-100 border border-transparent'
                                                                }`}
                                                        >
                                                            <input
                                                                type="checkbox"
                                                                className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                                                checked={assignedStudents.includes(student._id || student.id)}
                                                                onChange={() => toggleStudentSelection(student._id || student.id)}
                                                            />
                                                            <div className="ml-3 flex-1 flex justify-between">
                                                                <span className="font-medium text-gray-900">{student.username}</span>
                                                                <span className="text-gray-500 text-sm">{student.email}</span>
                                                            </div>
                                                        </label>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="p-6 border-t border-gray-200 flex justify-end gap-3 bg-gray-50">
                            <button
                                onClick={() => setIsAssignModalOpen(false)}
                                className="px-5 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveAssignment}
                                disabled={assignLoading}
                                className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50"
                            >
                                {assignLoading ? 'Saving...' : 'Save Assignment'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ExamManagement;
