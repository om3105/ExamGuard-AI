import { useEffect, useRef, useCallback } from 'react';
import api from '../services/api';

/**
 * useBehaviorLogger
 * Silently captures behavioral signals during an exam and periodically flushes
 * aggregated data to the backend for anomaly analysis.
 */
export const useBehaviorLogger = (examId, submissionId) => {
    // Raw event counters (held in refs to avoid re-renders)
    const keystrokeTimestamps = useRef([]); // array of timestamps
    const backspaceCount = useRef(0);
    const pasteCount = useRef(0);
    const pastedChars = useRef(0);
    const tabSwitchCount = useRef(0);
    const mouseClickCount = useRef(0);
    const questionTimes = useRef({}); // { "sIdx-qIdx": totalMs }
    const questionStartTime = useRef(Date.now());
    const currentQuestionKey = useRef(null);
    const flushTimer = useRef(null);
    const isActive = useRef(false);

    // -- Event Handlers --

    const handleKeyDown = useCallback((e) => {
        keystrokeTimestamps.current.push(Date.now());
        if (e.key === 'Backspace' || e.key === 'Delete') {
            backspaceCount.current += 1;
        }
    }, []);

    const handlePaste = useCallback((e) => {
        pasteCount.current += 1;
        const pastedText = e.clipboardData?.getData('text') || '';
        pastedChars.current += pastedText.length;
    }, []);

    const handleVisibilityChange = useCallback(() => {
        if (document.visibilityState === 'hidden') {
            tabSwitchCount.current += 1;
        }
    }, []);

    const handleMouseClick = useCallback(() => {
        mouseClickCount.current += 1;
    }, []);

    // -- Feature Extraction --

    const extractFeatures = () => {
        const timestamps = keystrokeTimestamps.current;
        const totalKeys = timestamps.length;

        // Calculate average typing speed (keys per second)
        let avgTypingSpeed = 0;
        if (timestamps.length >= 2) {
            const durationSec = (timestamps[timestamps.length - 1] - timestamps[0]) / 1000;
            if (durationSec > 0) {
                avgTypingSpeed = parseFloat((totalKeys / durationSec).toFixed(2));
            }
        }

        // Backspace ratio
        const backspaceRatio = totalKeys > 0
            ? parseFloat((backspaceCount.current / totalKeys).toFixed(3))
            : 0;

        return {
            exam_id: examId,
            submission_id: submissionId,
            keystroke_count: totalKeys,
            avg_typing_speed: avgTypingSpeed,
            backspace_ratio: backspaceRatio,
            paste_count: pasteCount.current,
            pasted_chars: pastedChars.current,
            tab_switch_count: tabSwitchCount.current,
            mouse_click_count: mouseClickCount.current,
            time_per_question: { ...questionTimes.current },
        };
    };

    // -- Flusher --

    const flush = useCallback(async () => {
        if (!examId || !isActive.current) return;

        // Commit current question time before flushing
        if (currentQuestionKey.current) {
            const elapsed = Date.now() - questionStartTime.current;
            questionTimes.current[currentQuestionKey.current] =
                (questionTimes.current[currentQuestionKey.current] || 0) + elapsed;
            questionStartTime.current = Date.now();
        }

        const features = extractFeatures();

        try {
            await api.post('/behavior/log', features);
        } catch {
            // Silently ignore — never disrupt the student
        }
    }, [examId, submissionId]);

    // -- Track active question --

    const setCurrentQuestion = useCallback((sectionIdx, questionIdx) => {
        const newKey = `${sectionIdx}-${questionIdx}`;
        if (currentQuestionKey.current && currentQuestionKey.current !== newKey) {
            // Save time spent on old question
            const elapsed = Date.now() - questionStartTime.current;
            questionTimes.current[currentQuestionKey.current] =
                (questionTimes.current[currentQuestionKey.current] || 0) + elapsed;
        }
        currentQuestionKey.current = newKey;
        questionStartTime.current = Date.now();
    }, []);

    // -- Lifecycle --

    useEffect(() => {
        if (!examId) return;

        isActive.current = true;

        document.addEventListener('keydown', handleKeyDown);
        document.addEventListener('paste', handlePaste);
        document.addEventListener('visibilitychange', handleVisibilityChange);
        document.addEventListener('click', handleMouseClick);

        // Flush every 15 seconds
        flushTimer.current = setInterval(flush, 15000);

        return () => {
            isActive.current = false;
            document.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('paste', handlePaste);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            document.removeEventListener('click', handleMouseClick);
            clearInterval(flushTimer.current);
        };
    }, [examId, handleKeyDown, handlePaste, handleVisibilityChange, handleMouseClick, flush]);

    return { setCurrentQuestion, flushFinal: flush };
};
