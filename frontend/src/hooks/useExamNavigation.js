import { useState } from 'react';

export const useExamNavigation = (exam, updateQuestionStatus, questionStatus) => {
    const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

    const currentSection = exam?.sections?.[currentSectionIndex];
    const currentQuestion = currentSection?.questions?.[currentQuestionIndex];
    const isLastQuestion = currentSectionIndex === (exam?.sections?.length || 0) - 1 &&
        currentQuestionIndex === (currentSection?.questions?.length || 0) - 1;

    const navigateToQuestion = (sIdx, qIdx) => {
        setCurrentSectionIndex(sIdx);
        setCurrentQuestionIndex(qIdx);

        // Mark as visited logic
        const key = `${sIdx}-${qIdx}`;
        // We call the passed update function logic
        // Note: It's cleaner if the hook encapsulates this, but status is handled by another hook
        // So we just rely on the parent component or pass the updater.

        if (updateQuestionStatus) {
            updateQuestionStatus(sIdx, qIdx, {
                visited: true,
                answered: questionStatus[`${sIdx}-${qIdx}`]?.answered || false,
                markedForReview: questionStatus[`${sIdx}-${qIdx}`]?.markedForReview || false
            });
        }
    };

    const navigateNext = () => {
        if (!exam) return;
        const section = exam.sections[currentSectionIndex];

        if (currentQuestionIndex < section.questions.length - 1) {
            navigateToQuestion(currentSectionIndex, currentQuestionIndex + 1);
        } else if (currentSectionIndex < exam.sections.length - 1) {
            navigateToQuestion(currentSectionIndex + 1, 0);
        }
    };

    return {
        currentSectionIndex,
        currentQuestionIndex,
        currentSection,
        currentQuestion,
        isLastQuestion,
        navigateToQuestion,
        navigateNext
    };
};
