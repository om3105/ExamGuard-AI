import { useState, useEffect } from 'react';
import { enrollmentAPI, studentAPI, courseAPI } from '../../services/adminApi';
import { CheckCircle, XCircle, Clock, Search, UserPlus, BookOpen } from 'lucide-react';

const CourseRequests = () => {
    const [enrollments, setEnrollments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('PENDING');
    const [actionLoading, setActionLoading] = useState(null);

    // Manual assignment state
    const [courses, setCourses] = useState([]);
    const [students, setStudents] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState('');
    const [selectedStudent, setSelectedStudent] = useState('');
    const [studentSearch, setStudentSearch] = useState('');
    const [showAssign, setShowAssign] = useState(false);

    const fetchEnrollments = async () => {
        setLoading(true);
        try {
            const res = await enrollmentAPI.getAll(statusFilter);
            setEnrollments(res.data);
        } catch (err) {
            console.error('Failed to fetch enrollments:', err);
        }
        setLoading(false);
    };

    useEffect(() => { fetchEnrollments(); }, [statusFilter]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [c, s] = await Promise.all([courseAPI.getAll(), studentAPI.getAll()]);
                setCourses(c.data);
                setStudents(s.data);
            } catch (err) { console.error(err); }
        };
        fetchData();
    }, []);

    const handleApprove = async (id) => {
        setActionLoading(id);
        try {
            await enrollmentAPI.approve(id);
            fetchEnrollments();
        } catch (err) { alert('Failed to approve'); }
        setActionLoading(null);
    };

    const handleReject = async (id) => {
        setActionLoading(id);
        try {
            await enrollmentAPI.reject(id);
            fetchEnrollments();
        } catch (err) { alert('Failed to reject'); }
        setActionLoading(null);
    };

    const handleManualAssign = async () => {
        if (!selectedCourse || !selectedStudent) return;
        try {
            await enrollmentAPI.addStudent(selectedCourse, selectedStudent);
            alert('Student enrolled successfully');
            setSelectedStudent('');
            fetchEnrollments();
        } catch (err) { alert('Failed to assign student'); }
    };

    const filteredStudents = students.filter(s =>
        s.username?.toLowerCase().includes(studentSearch.toLowerCase()) ||
        s.email?.toLowerCase().includes(studentSearch.toLowerCase())
    );

    const statusColors = {
        PENDING: 'bg-amber-100 text-amber-800',
        APPROVED: 'bg-green-100 text-green-800',
        REJECTED: 'bg-red-100 text-red-800',
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Course Enrollment Requests</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage student enrollment approvals</p>
                </div>
                <button
                    onClick={() => setShowAssign(!showAssign)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
                >
                    <UserPlus className="w-4 h-4" />
                    {showAssign ? 'Hide Manual Assign' : 'Assign Student'}
                </button>
            </div>

            {/* Manual Assignment Panel */}
            {showAssign && (
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
                    <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-blue-600" />
                        Manual Student Assignment
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="text-xs font-medium text-gray-500 block mb-1">Select Course</label>
                            <select
                                value={selectedCourse}
                                onChange={(e) => setSelectedCourse(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="">Choose a course...</option>
                                {courses.map(c => (
                                    <option key={c._id || c.id} value={c._id || c.id}>{c.title}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-medium text-gray-500 block mb-1">Search Student</label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    value={studentSearch}
                                    onChange={(e) => setStudentSearch(e.target.value)}
                                    placeholder="Search by name or email..."
                                    className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            {studentSearch && (
                                <div className="mt-1 max-h-32 overflow-y-auto border border-gray-200 rounded-lg bg-white shadow-sm">
                                    {filteredStudents.slice(0, 5).map(s => (
                                        <button
                                            key={s._id || s.id}
                                            onClick={() => { setSelectedStudent(s._id || s.id); setStudentSearch(s.username); }}
                                            className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 ${selectedStudent === (s._id || s.id) ? 'bg-blue-50' : ''}`}
                                        >
                                            {s.username} <span className="text-gray-400">({s.email})</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="flex items-end">
                            <button
                                onClick={handleManualAssign}
                                disabled={!selectedCourse || !selectedStudent}
                                className="w-full py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Assign to Course
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Filter Tabs */}
            <div className="flex gap-2 mb-4">
                {['PENDING', 'APPROVED', 'REJECTED'].map(s => (
                    <button
                        key={s}
                        onClick={() => setStatusFilter(s)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition ${statusFilter === s ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                    >
                        {s.charAt(0) + s.slice(1).toLowerCase()}
                    </button>
                ))}
            </div>

            {/* Enrollment Table */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="p-12 text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    </div>
                ) : enrollments.length === 0 ? (
                    <div className="p-12 text-center text-gray-500">
                        <Clock className="w-10 h-10 mx-auto mb-3 text-gray-300" />
                        No {statusFilter.toLowerCase()} enrollment requests
                    </div>
                ) : (
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Student</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Course</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Requested</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                                {statusFilter === 'PENDING' && (
                                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Actions</th>
                                )}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {enrollments.map(e => (
                                <tr key={e.id} className="hover:bg-gray-50 transition">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm">
                                                {e.student_name?.charAt(0).toUpperCase()}
                                            </div>
                                            <span className="font-medium text-gray-900 text-sm">{e.student_name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{e.course_title}</td>
                                    <td className="px-6 py-4 text-sm text-gray-500">{new Date(e.requested_at).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' })}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusColors[e.status]}`}>
                                            {e.status}
                                        </span>
                                    </td>
                                    {statusFilter === 'PENDING' && (
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex gap-2 justify-end">
                                                <button
                                                    onClick={() => handleApprove(e.id)}
                                                    disabled={actionLoading === e.id}
                                                    className="flex items-center gap-1 px-3 py-1.5 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition text-sm font-medium disabled:opacity-50"
                                                >
                                                    <CheckCircle className="w-4 h-4" /> Approve
                                                </button>
                                                <button
                                                    onClick={() => handleReject(e.id)}
                                                    disabled={actionLoading === e.id}
                                                    className="flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition text-sm font-medium disabled:opacity-50"
                                                >
                                                    <XCircle className="w-4 h-4" /> Reject
                                                </button>
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default CourseRequests;
