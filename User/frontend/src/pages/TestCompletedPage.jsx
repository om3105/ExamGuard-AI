import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const TestCompletedPage = () => {
    const navigate = useNavigate();
    const [submissionDetails, setSubmissionDetails] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Prevent back button navigation
        window.history.pushState(null, '', window.location.href);
        window.onpopstate = () => {
            window.history.pushState(null, '', window.location.href);
        };

        // Load submission details from sessionStorage
        const submissionId = sessionStorage.getItem('lastSubmissionId');
        const examTitle = sessionStorage.getItem('lastExamTitle');
        const submittedAt = sessionStorage.getItem('lastSubmittedAt');

        if (submissionId && examTitle && submittedAt) {
            setSubmissionDetails({
                submission_id: submissionId,
                exam_title: examTitle,
                submitted_at: submittedAt
            });
        }

        setLoading(false);

        // Cleanup function
        return () => {
            window.onpopstate = null;
        };
    }, []);

    const handleReturnToDashboard = () => {
        // Clear exam-related session data
        sessionStorage.removeItem('lastSubmissionId');
        sessionStorage.removeItem('lastExamTitle');
        sessionStorage.removeItem('lastSubmittedAt');

        // Navigate to dashboard
        navigate('/dashboard', { replace: true });
    };

    const formatDateTime = (isoString) => {
        if (!isoString) return '';
        const date = new Date(isoString);
        return date.toLocaleString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-gray-600">Loading...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
                {/* Success Icon */}
                <div className="flex justify-center mb-6">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                        <svg
                            className="w-10 h-10 text-green-600"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                            />
                        </svg>
                    </div>
                </div>

                {/* Success Message */}
                <h1 className="text-2xl font-bold text-center text-gray-900 mb-2">
                    Test Completed Successfully
                </h1>

                {/* Exam Details */}
                {submissionDetails && (
                    <div className="mb-6">
                        <div className="bg-gray-50 rounded-lg p-4 mb-4">
                            <p className="text-sm text-gray-500 mb-1">Exam</p>
                            <p className="text-lg font-semibold text-gray-900">
                                {submissionDetails.exam_title}
                            </p>
                        </div>

                        <div className="bg-gray-50 rounded-lg p-4">
                            <p className="text-sm text-gray-500 mb-1">Submitted At</p>
                            <p className="text-base text-gray-900">
                                {formatDateTime(submissionDetails.submitted_at)}
                            </p>
                        </div>
                    </div>
                )}

                {/* Informational Message */}
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-6">
                    <div className="flex items-start">
                        <svg
                            className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                        <div>
                            <p className="text-sm font-medium text-blue-900 mb-1">
                                Your responses have been successfully submitted.
                            </p>
                            <p className="text-sm text-blue-800">
                                You may now safely return to the dashboard.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Return to Dashboard Button */}
                <button
                    onClick={handleReturnToDashboard}
                    className="w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                    Return to Dashboard
                </button>
            </div>
        </div>
    );
};

export default TestCompletedPage;
