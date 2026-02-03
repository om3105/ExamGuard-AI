import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import WaitingRoomPage from './pages/WaitingRoomPage';
import ExamPage from './pages/ExamPage';
import TestCompletedPage from './pages/TestCompletedPage';

const ProtectedRoute = ({ children }) => {
    const { isAuthenticated } = useAuth();
    if (!isAuthenticated) {
        return <Navigate to="/login" />;
    }
    return <>{children}</>;
};

function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route
                        path="/dashboard"
                        element={
                            <ProtectedRoute>
                                <DashboardPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/exam/:examId/waiting-room"
                        element={
                            <ProtectedRoute>
                                <WaitingRoomPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/exam/:examId"
                        element={
                            <ProtectedRoute>
                                <ExamPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/test-completed"
                        element={
                            <ProtectedRoute>
                                <TestCompletedPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route path="/" element={<Navigate to="/dashboard" />} />
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;
