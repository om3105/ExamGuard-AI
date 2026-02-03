import { useState, useEffect } from 'react';

export const useQuestionStatus = (exam) => {
    const [questionStatus, setQuestionStatus] = useState({});

    // Initialize status when exam loads
    useEffect(() => {
        if (!exam) return;

        const initialStatus = {};
        exam.sections.forEach((section, sIdx) => {
            section.questions.forEach((_, qIdx) => {
                const key = `${sIdx}-${qIdx}`;
                initialStatus[key] = {
                    visited: sIdx === 0 && qIdx === 0,
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
            [key]: { ...prev[key], ...newStatus }
        }));
    };

    const getStatusCounts = () => {
        let answered = 0, notAnswered = 0, marked = 0, notVisited = 0;

        Object.values(questionStatus).forEach(status => {
            if (!status.visited) notVisited++;
            else if (status.visited && !status.answered) notAnswered++;
            if (status.answered) answered++;
            if (status.markedForReview) marked++;
        });

        return { answered, notAnswered, marked, notVisited };
    };

    const getQuestionButtonClass = (sIdx, qIdx, currentSIdx, currentQIdx) => {
        const key = `${sIdx}-${qIdx}`;
        const status = questionStatus[key] || {};
        const isCurrent = sIdx === currentSIdx && qIdx === currentQIdx;

        let colorClass = 'bg-gray-200 text-gray-700 hover:bg-gray-300'; // Not visited

        if (status.visited && !status.answered && !status.markedForReview) {
            colorClass = 'bg-red-500 text-white hover:bg-red-600'; // Visited not answered
        } else if (status.answered && !status.markedForReview) {
            colorClass = 'bg-green-500 text-white hover:bg-green-600'; // Answered
        } else if (!status.answered && status.markedForReview) {
            colorClass = 'bg-yellow-500 text-white hover:bg-yellow-600'; // Marked for review
        } else if (status.answered && status.markedForReview) {
            colorClass = 'bg-gradient-to-br from-green-500 to-yellow-500 text-white'; // Both
        }

        if (isCurrent) {
            return `${colorClass} ring-2 ring-blue-600 ring-offset-2 scale-110`;
        }

        return colorClass;
    };

    return {
        questionStatus,
        updateQuestionStatus,
        getStatusCounts,
        getQuestionButtonClass
    };
};
