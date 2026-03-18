import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// --- User/Student Imports ---
import { AuthProvider, useAuth } from './student/context/AuthContext';
const UserLoginPage = React.lazy(() => import('./student/pages/LoginPage'));
const UserRegisterPage = React.lazy(() => import('./student/pages/RegisterPage'));
const UserDashboardPage = React.lazy(() => import('./student/pages/DashboardPage'));
const WaitingRoomPage = React.lazy(() => import('./student/pages/WaitingRoomPage'));
const ExamPage = React.lazy(() => import('./student/pages/ExamPage'));
const TestCompletedPage = React.lazy(() => import('./student/pages/TestCompletedPage'));
const CourseList = React.lazy(() => import('./student/pages/CourseList'));
const CourseView = React.lazy(() => import('./student/pages/CourseView'));
const StudentProfile = React.lazy(() => import('./student/pages/StudentProfile'));

// --- Admin Imports ---
import { AdminAuthProvider, useAdminAuth } from './admin/context/AdminAuthContext';
import AdminSidebar from './admin/components/Sidebar';
const AdminLogin = React.lazy(() => import('./admin/pages/Login'));
const AdminRegister = React.lazy(() => import('./admin/pages/Register'));
const AdminDashboard = React.lazy(() => import('./admin/pages/Dashboard'));
const ExamManagement = React.lazy(() => import('./admin/pages/ExamManagement'));
const Students = React.lazy(() => import('./admin/pages/Students'));
const Analytics = React.lazy(() => import('./admin/pages/Analytics'));
const CreateExam = React.lazy(() => import('./admin/pages/CreateExam'));
const AITestGenerator = React.lazy(() => import('./admin/pages/AITestGenerator'));
const ExamResults = React.lazy(() => import('./admin/pages/ExamResults'));
const PreviewExam = React.lazy(() => import('./admin/pages/PreviewExam'));
const CourseManagement = React.lazy(() => import('./admin/pages/CourseManagement'));
const LiveMonitoring = React.lazy(() => import('./admin/pages/LiveMonitoring'));
const CourseRequests = React.lazy(() => import('./admin/pages/CourseRequests'));
const EditExam = React.lazy(() => import('./admin/pages/EditExam'));
const EditCourse = React.lazy(() => import('./admin/pages/EditCourse'));
const StudentProgress = React.lazy(() => import('./admin/pages/StudentProgress'));

// --- Shared Styles ---
import './App.css';

// --- Server Waking Overlay (Render cold start) ---
import ServerWakingOverlay from './components/ServerWakingOverlay';

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
                    <Suspense fallback={
                        <div className="flex items-center justify-center min-h-screen">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        </div>
                    }>
                        {/* Global cold-start overlay */}
                        <ServerWakingOverlay />
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
                        <Route path="/admin/ai-test" element={<AdminProtectedRoute><AdminDashboardLayout><AITestGenerator /></AdminDashboardLayout></AdminProtectedRoute>} />
                        <Route path="/admin/exams/:examId/results" element={<AdminProtectedRoute><AdminDashboardLayout><ExamResults /></AdminDashboardLayout></AdminProtectedRoute>} />
                        <Route path="/admin/exams/:examId/preview" element={<AdminProtectedRoute><AdminDashboardLayout><PreviewExam /></AdminDashboardLayout></AdminProtectedRoute>} />
                        <Route path="/admin/exams/:examId/edit" element={<AdminProtectedRoute><AdminDashboardLayout><EditExam /></AdminDashboardLayout></AdminProtectedRoute>} />
                        <Route path="/admin/courses/:courseId/edit" element={<AdminProtectedRoute><AdminDashboardLayout><EditCourse /></AdminDashboardLayout></AdminProtectedRoute>} />
                        <Route path="/admin/progress" element={<AdminProtectedRoute><AdminDashboardLayout><StudentProgress /></AdminDashboardLayout></AdminProtectedRoute>} />

                        {/* Defaults */}
                        <Route path="/admin" element={<Navigate to="/admin/dashboard" />} />
                        <Route path="/" element={<Navigate to="/dashboard" />} />
                        <Route path="*" element={<Navigate to="/" />} />
                    </Routes>
                    </Suspense>
                </AdminAuthProvider>
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;
