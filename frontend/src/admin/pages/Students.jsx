
import { useEffect, useState } from 'react';
import { studentAPI } from '../services/adminApi';
import { Users, Mail, Calendar, Trash2, UserCheck, Search, Filter, ShieldAlert, CheckCircle, XCircle, FileText, ArrowLeft, RefreshCw, BarChart2, Shield, UserPlus } from 'lucide-react';
import Modal from '../components/Modal';

const Students = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredStudents, setFilteredStudents] = useState([]);

    // View state
    const [viewMode, setViewMode] = useState('list'); // 'list' or 'profile'
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [studentExams, setStudentExams] = useState([]);
    const [loadingExams, setLoadingExams] = useState(false);

    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [studentToDelete, setStudentToDelete] = useState(null);

    // Add Student modal
    const [addModalOpen, setAddModalOpen] = useState(false);
    const [addForm, setAddForm] = useState({ username: '', email: '', password: '' });
    const [addLoading, setAddLoading] = useState(false);
    const [addError, setAddError] = useState('');

    useEffect(() => {
        fetchStudents();
    }, []);

    const handleCreateStudent = async (e) => {
        e.preventDefault();
        setAddLoading(true);
        setAddError('');
        try {
            await studentAPI.create(addForm);
            setAddModalOpen(false);
            setAddForm({ username: '', email: '', password: '' });
            await fetchStudents();
        } catch (err) {
            setAddError(err.response?.data?.detail || 'Failed to create student');
        } finally {
            setAddLoading(false);
        }
    };

    useEffect(() => {
        const filtered = students.filter(student =>
            student.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.email.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredStudents(filtered);
    }, [students, searchTerm]);

    const fetchStudents = async () => {
        try {
            const response = await studentAPI.getAll();
            setStudents(response.data);
        } catch (error) {
            console.error('Failed to fetch students:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchStudentProfile = async (student) => {
        setSelectedStudent(student);
        setViewMode('profile');
        setLoadingExams(true);
        try {
            const response = await studentAPI.getSubmissions(student.id);
            // Sort by latest first
            setStudentExams(response.data.sort((a, b) => new Date(b.submitted_at) - new Date(a.submitted_at)));
        } catch (error) {
            console.error('Failed to fetch student exam history:', error);
        } finally {
            setLoadingExams(false);
        }
    };

    const toggleStudentStatus = async (studentId, currentStatus) => {
        try {
            await studentAPI.updateStatus(studentId, !currentStatus);
            // Update local state
            setStudents(students.map(s =>
                s.id === studentId ? { ...s, is_active: !currentStatus } : s
            ));
            if (selectedStudent && selectedStudent.id === studentId) {
                setSelectedStudent({ ...selectedStudent, is_active: !currentStatus });
            }
        } catch (error) {
            console.error('Failed to update student status:', error);
            alert('Failed to update account status');
        }
    };

    const handleDeleteClick = (student) => {
        setStudentToDelete(student);
        setDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!studentToDelete) return;
        try {
            await studentAPI.delete(studentToDelete.id);
            setStudents(students.filter((s) => s.id !== studentToDelete.id));
            setDeleteModalOpen(false);
            setStudentToDelete(null);
            if (viewMode === 'profile') setViewMode('list');
        } catch (error) {
            console.error('Failed to delete student:', error);
            alert('Failed to delete student');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (viewMode === 'profile' && selectedStudent) {
        return (
            <>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Profile Header */}
                    <div className="mb-6">
                        <button
                            onClick={() => setViewMode('list')}
                            className="text-sm text-gray-500 hover:text-blue-600 flex items-center gap-1 font-medium transition-colors mb-4"
                        >
                            <ArrowLeft className="w-4 h-4" /> Back to Students
                        </button>

                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="p-8 sm:p-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                                <div className="flex items-center gap-6">
                                    <div className="h-24 w-24 rounded-2xl bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center text-blue-700 font-bold text-4xl shadow-inner border border-blue-100">
                                        {selectedStudent.username.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <h1 className="text-3xl font-bold text-gray-900">{selectedStudent.username}</h1>
                                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                                            <span className="flex items-center gap-1.5"><Mail className="w-4 h-4 text-gray-400" />{selectedStudent.email}</span>
                                            <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4 text-gray-400" />Joined {new Date(selectedStudent.created_at).toLocaleDateString()}</span>
                                        </div>
                                        <div className="mt-3 flex items-center gap-3">
                                            {selectedStudent.is_active ?
                                                <span className="px-3 py-1 rounded-full bg-green-100 text-green-800 text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                                                    <CheckCircle className="w-3 h-3" /> Active Account
                                                </span> :
                                                <span className="px-3 py-1 rounded-full bg-red-100 text-red-800 text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                                                    <XCircle className="w-3 h-3" /> Deactivated
                                                </span>
                                            }
                                            <span className="text-gray-400">ID: {selectedStudent.id}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-3 w-full sm:w-auto">
                                    <button
                                        onClick={() => toggleStudentStatus(selectedStudent.id, selectedStudent.is_active)}
                                        className={`px-4 py-2 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-colors ${selectedStudent.is_active
                                            ? 'bg-orange-50 text-orange-700 hover:bg-orange-100 border border-orange-200'
                                            : 'bg-green-50 text-green-700 hover:bg-green-100 border border-green-200'
                                            }`}
                                    >
                                        {selectedStudent.is_active ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                                        {selectedStudent.is_active ? 'Deactivate Account' : 'Activate Account'}
                                    </button>
                                    <button
                                        onClick={() => handleDeleteClick(selectedStudent)}
                                        className="px-4 py-2 bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" /> Delete Student
                                    </button>
                                </div>
                            </div>

                            {/* Quick Stats Strip */}
                            <div className="bg-gray-50 border-t border-gray-100 grid grid-cols-1 divide-y divide-gray-100 sm:grid-cols-3 sm:divide-y-0 sm:divide-x">
                                <div className="px-6 py-5 text-center">
                                    <p className="text-sm font-medium text-gray-500">Total Exams Taken</p>
                                    <p className="mt-1 text-3xl font-bold text-gray-900">{studentExams.length}</p>
                                </div>
                                <div className="px-6 py-5 text-center">
                                    <p className="text-sm font-medium text-gray-500">Average Score</p>
                                    <p className="mt-1 text-3xl font-bold text-blue-600">
                                        {studentExams.length > 0 ? Math.round(studentExams.reduce((acc, curr) => acc + (curr.score || 0), 0) / studentExams.length) : '-'}
                                    </p>
                                </div>
                                <div className="px-6 py-5 text-center">
                                    <p className="text-sm font-medium text-gray-500">Average Integrity</p>
                                    <p className="mt-1 text-3xl font-bold text-green-600">
                                        {studentExams.length > 0 ? (
                                            Math.round(studentExams.reduce((acc, curr) => acc + (curr.anomaly_score || 0), 0) / studentExams.length)
                                        ) : '-'}<span className="text-xl"></span>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Exam History Section */}
                    <div>
                        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <FileText className="w-5 h-5 text-blue-600" /> Exam History
                        </h2>

                        <div className="bg-white border border-gray-200 shadow-sm rounded-xl overflow-hidden">
                            {loadingExams ? (
                                <div className="flex justify-center py-12">
                                    <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
                                </div>
                            ) : studentExams.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Exam Title</th>
                                                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Score</th>
                                                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Breakdown</th>
                                                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Integrity</th>
                                                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Completed</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {studentExams.map((exam) => (
                                                <tr key={exam.id} className="hover:bg-gray-50 transition-colors">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm font-medium text-gray-900">{exam.exam_title}</div>
                                                        <div className="text-xs border mt-1 border-gray-200 bg-gray-50 text-gray-500 inline-block px-2 py-0.5 rounded">Attempt {exam.attempt_number}</div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                                        <span className="text-xl font-bold text-gray-900">{exam.score || 0}</span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex justify-center gap-4 text-xs">
                                                            <div className="text-center">
                                                                <div className="font-semibold text-blue-600">{exam.mcq_score || 0}</div>
                                                                <div className="text-gray-400">MCQ</div>
                                                            </div>
                                                            <div className="text-center">
                                                                <div className="font-semibold text-purple-600">{exam.coding_score || 0}</div>
                                                                <div className="text-gray-400">Coding</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                                        {exam.anomaly_score !== undefined ? (
                                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${exam.risk_level === 'HIGH' ? 'bg-red-100 text-red-800' :
                                                                exam.risk_level === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                                                                    'bg-green-100 text-green-800'
                                                                }`}>
                                                                {exam.risk_level === 'HIGH' && <ShieldAlert className="w-3 h-3 mr-1" />}
                                                                {exam.risk_level === 'MEDIUM' && <Shield className="w-3 h-3 mr-1" />}
                                                                {exam.risk_level === 'LOW' && <Shield className="w-3 h-3 mr-1" />}
                                                                Score: {exam.anomaly_score}
                                                            </span>
                                                        ) : (
                                                            <span className="text-xs text-gray-400 border border-gray-200 px-2 py-1 rounded-full">Not Evaluated</span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                                                        {new Date(exam.submitted_at).toLocaleDateString()}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="p-12 text-center text-gray-500 bg-gray-50/50">
                                    <BarChart2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                    <p className="font-medium">No exams taken yet</p>
                                    <p className="text-sm mt-1">This student hasn't completed any assignments.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                {/* Delete Modal (must be here so it works from profile view) */}
                <Modal
                    isOpen={deleteModalOpen}
                    onClose={() => setDeleteModalOpen(false)}
                    title="Remove Student Account"
                >
                    <div>
                        <div className="flex items-center justify-center mb-6">
                            <div className="bg-red-50 p-4 rounded-full border-4 border-red-100">
                                <ShieldAlert className="w-10 h-10 text-red-600" />
                            </div>
                        </div>
                        <p className="text-center text-gray-800 mb-6 font-medium">
                            Are you certain you want to delete <span className="font-bold border-b-2 border-red-200">{studentToDelete?.username}</span>?
                            <br /><span className="text-sm text-gray-500 block mt-2 font-normal">This action permanently deletes their identity and all associated exam history.</span>
                        </p>
                        <div className="flex gap-3 justify-center">
                            <button
                                onClick={() => setDeleteModalOpen(false)}
                                className="px-6 py-2.5 text-sm font-bold text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors shadow-sm"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="px-6 py-2.5 text-sm font-bold text-white bg-red-600 border border-transparent rounded-xl hover:bg-red-700 transition-colors shadow-sm flex items-center gap-2"
                            >
                                <Trash2 className="w-4 h-4" /> Delete Account
                            </button>
                        </div>
                    </div>
                </Modal>
            </>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Student Directory</h1>
                    <p className="text-gray-500 mt-1">Manage accounts and analyze candidate performance</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => { setAddModalOpen(true); setAddError(''); }}
                        className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                    >
                        <UserPlus className="w-4 h-4" />
                        Add Student
                    </button>
                    <div className="flex items-center gap-4 bg-white px-5 py-3 rounded-xl border border-gray-200 shadow-sm">
                        <div className="bg-blue-50 p-2 rounded-lg"><Users className="w-6 h-6 text-blue-600" /></div>
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Registered</p>
                            <p className="text-2xl font-black text-gray-900 leading-none mt-1">{students.length}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Search and Filter */}
            <div className="flex gap-4 mb-6">
                <div className="relative flex-1 max-w-md">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="w-5 h-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search by student name or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-xl leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-shadow shadow-sm"
                    />
                </div>
            </div>

            {/* Students Table */}
            <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
                {filteredStudents.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-slate-50 border-b border-gray-200">
                                <tr>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Candidate</th>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Contact Info</th>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Account Status</th>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Registration Date</th>
                                    <th scope="col" className="relative px-6 py-4"><span className="sr-only">Actions</span></th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-100">
                                {filteredStudents.map((student) => (
                                    <tr key={student.id} className="hover:bg-blue-50/50 transition-colors group cursor-pointer" onClick={() => fetchStudentProfile(student)}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-10 w-10">
                                                    <div className="h-10 w-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-lg border border-blue-200 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                                        {student.username.charAt(0).toUpperCase()}
                                                    </div>
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-bold text-gray-900 group-hover:text-blue-700 transition-colors">{student.username}</div>
                                                    <div className="text-xs text-gray-500 mt-0.5">ID: {student.id.substring(0, 8)}...</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center text-sm text-gray-600">
                                                <Mail className="flex-shrink-0 mr-2 h-4 w-4 text-gray-400" />
                                                {student.email}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {student.is_active ? (
                                                <span className="px-2.5 py-1 inline-flex text-xs leading-5 font-bold rounded-full bg-green-100 text-green-800 border border-green-200">
                                                    Active
                                                </span>
                                            ) : (
                                                <span className="px-2.5 py-1 inline-flex text-xs leading-5 font-bold rounded-full bg-red-100 text-red-800 border border-red-200">
                                                    Deactivated
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900 font-medium">
                                                {new Date(student.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); fetchStudentProfile(student); }}
                                                    className="px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg font-medium text-xs transition-colors"
                                                >
                                                    View Details
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="p-16 text-center bg-gray-50/50">
                        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-2xl bg-white shadow-sm border border-gray-100 mb-4">
                            <Users className="h-8 w-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">No candidates found</h3>
                        <p className="mt-2 text-sm text-gray-500 max-w-sm mx-auto">
                            {searchTerm ? 'No matches found for your search query. Try a different name or email.' : 'Your student directory is currently empty. They will appear here once registered.'}
                        </p>
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm('')}
                                className="mt-6 inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-lg text-blue-700 bg-blue-100 hover:bg-blue-200 transition-colors"
                            >
                                Clear Search
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                title="Remove Student Account"
            >
                <div>
                    <div className="flex items-center justify-center mb-6">
                        <div className="bg-red-50 p-4 rounded-full border-4 border-red-100">
                            <ShieldAlert className="w-10 h-10 text-red-600" />
                        </div>
                    </div>
                    <p className="text-center text-gray-800 mb-6 font-medium">
                        Are you certain you want to delete <span className="font-bold border-b-2 border-red-200">{studentToDelete?.username}</span>?
                        <br /><span className="text-sm text-gray-500 block mt-2 font-normal">This action permanently deletes their identity and all associated exam history.</span>
                    </p>
                    <div className="flex gap-3 justify-center">
                        <button
                            onClick={() => setDeleteModalOpen(false)}
                            className="px-6 py-2.5 text-sm font-bold text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors shadow-sm"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={confirmDelete}
                            className="px-6 py-2.5 text-sm font-bold text-white bg-red-600 border border-transparent rounded-xl hover:bg-red-700 transition-colors shadow-sm flex items-center gap-2"
                        >
                            <Trash2 className="w-4 h-4" /> Delete Account
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Add Student Modal */}
            <Modal
                isOpen={addModalOpen}
                onClose={() => setAddModalOpen(false)}
                title="Add New Student"
            >
                <form onSubmit={handleCreateStudent} className="space-y-4">
                    {addError && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                            {addError}
                        </div>
                    )}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                        <input
                            type="text"
                            required
                            value={addForm.username}
                            onChange={(e) => setAddForm({ ...addForm, username: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                            placeholder="Enter candidate name"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                        <input
                            type="email"
                            required
                            value={addForm.email}
                            onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                            placeholder="candidate@organization.com"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                        <input
                            type="password"
                            required
                            minLength={6}
                            value={addForm.password}
                            onChange={(e) => setAddForm({ ...addForm, password: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                            placeholder="••••••••"
                        />
                    </div>
                    <div className="flex gap-3 justify-end pt-2">
                        <button
                            type="button"
                            onClick={() => setAddModalOpen(false)}
                            className="px-5 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={addLoading}
                            className="px-5 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center gap-2"
                        >
                            <UserPlus className="w-4 h-4" />
                            {addLoading ? 'Creating...' : 'Create Student'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Students;
