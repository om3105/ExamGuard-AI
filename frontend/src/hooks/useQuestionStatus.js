import { useState, useEffect } from 'react';

export const useQuestionStatus = (exam) => {
    const [questionStatus, setQuestionStatus] = useState({});

    // Initialize status when exam loads
    useEffect(() => {
        if (!exam) return;

        const initialStatus = {};
        exam.sections?.forEach((section, sIdx) => {
            section.questions?.forEach((_, qIdx) => {
                const key = `${sIdx}-${qIdx}`;
                initialStatus[key] = {
                    visited: sIdx === 0 && qIdx === 0, // Mark first question visited
                    answered: false,
                    markedForReview: false
                };
            });
        });
        setQuestionStatus(initialStatus);
    }, [exam]);

    const updateQuestionStatus = (sIdx, qIdx, newStatus) => {
        const key = `${sIdx}-${qIdx}`;
        setQuestionStatus(prev => ({
            ...prev,
            [key]: { ...(prev[key] || {}), ...newStatus }
        }));
    };

    const getStatusCounts = () => {
        let answered = 0, notAnswered = 0, marked = 0, notVisited = 0;

        Object.values(questionStatus).forEach(status => {
            if (!status.visited) {
                notVisited++;
            } else if (status.markedForReview) {
                marked++;
            } else if (status.answered) {
                answered++;
            } else {
                notAnswered++;
            }
        });

        return { answered, notAnswered, marked, notVisited };
    };

    const getQuestionButtonClass = (sIdx, qIdx, currentSIdx, currentQIdx) => {
        const key = `${sIdx}-${qIdx}`;
        const status = questionStatus[key] || { visited: false, answered: false, markedForReview: false };
        const isCurrent = sIdx === currentSIdx && qIdx === currentQIdx;

        let baseClass = 'w-10 h-10 rounded-lg text-sm font-bold shadow-sm transition-all focus:outline-none flex items-center justify-center';
        let colorClass = 'bg-gray-100 text-gray-400 border border-gray-200'; // Default: Not visited (Grey)

        if (status.markedForReview) {
            colorClass = status.answered
                ? 'bg-purple-500 text-white border-purple-600 shadow-purple-200 shadow-md' // Answered & Marked
                : 'bg-yellow-500 text-white border-yellow-600 shadow-yellow-200 shadow-md'; // Marked for review (Yellow)
        } else if (status.answered) {
            colorClass = 'bg-green-500 text-white border-green-600 shadow-green-200 shadow-md'; // Answered (Green)
        } else if (status.visited) {
            colorClass = 'bg-red-500 text-white border-red-600 shadow-red-200 shadow-md'; // Visited but not answered (Red)
        }

        if (isCurrent) {
            // Apply a distinct blue ring around the active question
            return `${baseClass} ${colorClass} ring-4 ring-blue-400 ring-offset-2 scale-110 relative z-10`;
        }

        return `${baseClass} ${colorClass} hover:opacity-80`;
    };

    return {
        questionStatus,
        updateQuestionStatus,
        getStatusCounts,
        getQuestionButtonClass
    };
};
