import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// --- User/Student Imports ---
import { AuthProvider, useAuth } from './student/context/AuthContext';
import UserLoginPage from './student/pages/LoginPage';
import UserRegisterPage from './student/pages/RegisterPage';
import UserDashboardPage from './student/pages/DashboardPage';
import WaitingRoomPage from './student/pages/WaitingRoomPage';
import ExamPage from './student/pages/ExamPage';
import TestCompletedPage from './student/pages/TestCompletedPage';
import CourseList from './student/pages/CourseList';
import CourseView from './student/pages/CourseView';
import StudentProfile from './student/pages/StudentProfile';

// --- Admin Imports ---
import { AdminAuthProvider, useAdminAuth } from './admin/context/AdminAuthContext';
import AdminSidebar from './admin/components/Sidebar';
import AdminLogin from './admin/pages/Login';
import AdminRegister from './admin/pages/Register';
import AdminDashboard from './admin/pages/Dashboard';
import ExamManagement from './admin/pages/ExamManagement';
import Students from './admin/pages/Students';
import Analytics from './admin/pages/Analytics';
import CreateExam from './admin/pages/CreateExam';
import ExamResults from './admin/pages/ExamResults';
import PreviewExam from './admin/pages/PreviewExam';
import CourseManagement from './admin/pages/CourseManagement';
import LiveMonitoring from './admin/pages/LiveMonitoring';
import CourseRequests from './admin/pages/CourseRequests';

// --- Shared Styles ---
import './App.css';

// --- Protected Route Wrappers ---
const UserProtectedRoute = ({ children }) => {
    const { isAuthenticated } = useAuth();
    if (!isAuthenticated) return <Navigate to="/login" />;
    return <>{children}</>;
};

const AdminProtectedRoute = ({ children }) => {
    const { admin, loading } = useAdminAuth();
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }
    return admin ? children : <Navigate to="/admin/login" />;
};

const AdminDashboardLayout = ({ children }) => {
    return (
        <div className="flex min-h-screen bg-gray-50">
            <AdminSidebar />
            <div className="flex-1 lg:ml-64">
                {children}
            </div>
        </div>
    );
};

function App() {
    return (
        <BrowserRouter>
            {/* Wrap both providers at the top level */}
            <AuthProvider>
                <AdminAuthProvider>
                    <Routes>
                        {/* =========================================
                            USER / EXAM ROUTES
                            ========================================= */}
                        <Route path="/login" element={<UserLoginPage />} />
                        <Route path="/register" element={<UserRegisterPage />} />
                        <Route path="/dashboard" element={<UserProtectedRoute><UserDashboardPage /></UserProtectedRoute>} />
                        <Route path="/courses" element={<UserProtectedRoute><CourseList /></UserProtectedRoute>} />
                        <Route path="/courses/:courseId" element={<UserProtectedRoute><CourseView /></UserProtectedRoute>} />
                        <Route path="/exam/:examId/waiting-room" element={<UserProtectedRoute><WaitingRoomPage /></UserProtectedRoute>} />
                        <Route path="/exam/:examId" element={<UserProtectedRoute><ExamPage /></UserProtectedRoute>} />
                        <Route path="/test-completed" element={<UserProtectedRoute><TestCompletedPage /></UserProtectedRoute>} />
                        <Route
                            path="/profile"
                            element={
                                <UserProtectedRoute>
                                    <StudentProfile />
                                </UserProtectedRoute>
                            }
                        />

                        {/* =========================================
                            ADMIN ROUTES
                            ========================================= */}
                        <Route path="/admin/login" element={<AdminLogin />} />
                        <Route path="/admin/register" element={<AdminProtectedRoute><AdminDashboardLayout><AdminRegister /></AdminDashboardLayout></AdminProtectedRoute>} />
                        <Route path="/admin/dashboard" element={<AdminProtectedRoute><AdminDashboardLayout><AdminDashboard /></AdminDashboardLayout></AdminProtectedRoute>} />
                        <Route path="/admin/exams" element={<AdminProtectedRoute><AdminDashboardLayout><ExamManagement /></AdminDashboardLayout></AdminProtectedRoute>} />
                        <Route path="/admin/courses" element={<AdminProtectedRoute><AdminDashboardLayout><CourseManagement /></AdminDashboardLayout></AdminProtectedRoute>} />
                        <Route path="/admin/enrollments" element={<AdminProtectedRoute><AdminDashboardLayout><CourseRequests /></AdminDashboardLayout></AdminProtectedRoute>} />
                        <Route path="/admin/students" element={<AdminProtectedRoute><AdminDashboardLayout><Students /></AdminDashboardLayout></AdminProtectedRoute>} />
                        <Route path="/admin/analytics" element={<AdminProtectedRoute><AdminDashboardLayout><Analytics /></AdminDashboardLayout></AdminProtectedRoute>} />
                        <Route path="/admin/monitoring" element={<AdminProtectedRoute><AdminDashboardLayout><LiveMonitoring /></AdminDashboardLayout></AdminProtectedRoute>} />
                        <Route path="/admin/create-exam" element={<AdminProtectedRoute><AdminDashboardLayout><CreateExam /></AdminDashboardLayout></AdminProtectedRoute>} />
                        <Route path="/admin/exams/:examId/results" element={<AdminProtectedRoute><AdminDashboardLayout><ExamResults /></AdminDashboardLayout></AdminProtectedRoute>} />
                        <Route path="/admin/exams/:examId/preview" element={<AdminProtectedRoute><AdminDashboardLayout><PreviewExam /></AdminDashboardLayout></AdminProtectedRoute>} />

                        {/* Defaults */}
                        <Route path="/admin" element={<Navigate to="/admin/dashboard" />} />
                        <Route path="/" element={<Navigate to="/dashboard" />} />
                        <Route path="*" element={<Navigate to="/" />} />
                    </Routes>
                </AdminAuthProvider>
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;
