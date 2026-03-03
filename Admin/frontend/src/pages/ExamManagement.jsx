import { useEffect, useState } from 'react';
import { examAPI } from '../services/adminApi';
import { Plus, Edit, Trash2, Eye, Calendar, Clock, FileText, BookOpen, Users, Award, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ExamManagement = () => {
    const [exams, setExams] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchExams();
    }, []);

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
                <button
                    onClick={() => navigate('/create-exam')}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm font-medium"
                >
                    <Plus className="w-5 h-5" />
                    <span>Create New Exam</span>
                </button>
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
                                        onClick={() => navigate(`/exams/${exam._id}/preview`)}
                                        className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-gray-200"
                                        title="Preview Exam Content"
                                    >
                                        <Eye className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => navigate(`/exams/${exam._id}/results`)}
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
                            onClick={() => navigate('/create-exam')}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm font-medium"
                        >
                            <Zap className="w-4 h-4" />
                            <span>Create Your First Exam</span>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ExamManagement;
