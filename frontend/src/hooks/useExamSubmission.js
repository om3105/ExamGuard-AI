import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const useExamSubmission = (examId, submissionId) => {
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSubmitModal, setShowSubmitModal] = useState(false);

    const submitExam = async (answers) => {
        try {
            setShowSubmitModal(false);
            setIsSubmitting(true);

            // Dynamic import to avoid circular dep issues if any, preserving original style
            const { submitExam: apiSubmit } = await import('../services/api');

            const response = await apiSubmit(examId, answers, submissionId);

            sessionStorage.setItem('lastSubmissionId', response.submission_id);
            sessionStorage.setItem('lastExamTitle', response.exam_title);
            sessionStorage.setItem('lastSubmittedAt', response.submitted_at);

            navigate('/test-completed', { replace: true });
        } catch (error) {
            console.error("Submission failed:", error);
            setIsSubmitting(false);

            // Handle specific error cases
            if (error.response?.status === 400) {
                const errorDetail = error.response?.data?.detail || "";

                // If user already submitted, redirect to test completed page
                if (errorDetail.includes("already submitted")) {
                    alert("You have already submitted this exam. Redirecting...");
                    navigate('/test-completed', { replace: true });
                    return;
                }

                alert(`Submission error: ${errorDetail}`);
            } else if (error.response?.status === 404) {
                alert("Exam not found. Please contact support.");
            } else {
                alert("Failed to submit exam. Please check your connection and try again.");
            }

            setShowSubmitModal(true); // Re-open modal for retry
        }
    };

    return {
        isSubmitting,
        submitExam,
        showSubmitModal,
        setShowSubmitModal
    };
};
