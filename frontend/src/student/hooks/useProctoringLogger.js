import { useEffect, useRef, useCallback } from 'react';
import api from '../services/api';

/**
 * useBehaviorLogger
 * 
 * Silently captures behavioral signals during an exam and periodically flushes
 * DELTA-based data to the backend for anomaly analysis.
 * 
 * IMPORTANT: This hook sends DELTAS (only new events since last flush), NOT
 * cumulative totals. The backend accumulates these deltas into a single
 * BehaviorLog document per (user_id, exam_id) session.
 * 
 * Events captured:
 * - Keystrokes (count, speed, backspace ratio)
 * - Paste attempts (count + character count)
 * - Tab switches / visibility changes (debounced)
 * - Mouse clicks
 * - Per-question time tracking
 * - Raw event timeline for admin review
 */
export const useBehaviorLogger = (examId, submissionId) => {
    // --- Delta counters (reset after each flush) ---
    const keystrokeTimestamps = useRef([]);
    const backspaceCount = useRef(0);
    const deltaKeystrokes = useRef(0);
    const deltaPasteCount = useRef(0);
    const deltaPastedChars = useRef(0);
    const deltaTabSwitches = useRef(0);
    const deltaMouseClicks = useRef(0);
    const deltaEvents = useRef([]);  // raw event timeline

    // --- Session state (persistent across flushes) ---
    const questionTimes = useRef({});
    const questionStartTime = useRef(Date.now());
    const currentQuestionKey = useRef(null);
    const flushTimer = useRef(null);
    const isActive = useRef(false);
    const lastVisibilityChange = useRef(0); // debounce timestamp

    // -- Event Handlers --

    const handleKeyDown = useCallback((e) => {
        keystrokeTimestamps.current.push(Date.now());
        deltaKeystrokes.current += 1;
        if (e.key === 'Backspace' || e.key === 'Delete') {
            backspaceCount.current += 1;
        }
    }, []);

    const handlePaste = useCallback((e) => {
        deltaPasteCount.current += 1;
        const pastedText = e.clipboardData?.getData('text') || '';
        deltaPastedChars.current += pastedText.length;
        deltaEvents.current.push({
            type: 'paste',
            timestamp: new Date().toISOString(),
        });
    }, []);

    const handleVisibilityChange = useCallback(() => {
        // Debounce: ignore events within 500ms of each other
        // (browsers often fire multiple visibility events in rapid succession)
        const now = Date.now();
        if (now - lastVisibilityChange.current < 500) return;
        lastVisibilityChange.current = now;

        if (document.visibilityState === 'hidden') {
            deltaTabSwitches.current += 1;
            deltaEvents.current.push({
                type: 'tab_switch',
                timestamp: new Date().toISOString(),
            });
        }
    }, []);

    const handleWindowBlur = useCallback(() => {
        // Fallback for tab detection — some browsers don't fire visibilitychange
        const now = Date.now();
        if (now - lastVisibilityChange.current < 500) return;
        lastVisibilityChange.current = now;

        deltaTabSwitches.current += 1;
        deltaEvents.current.push({
            type: 'blur',
            timestamp: new Date().toISOString(),
        });
    }, []);

    const handleMouseClick = useCallback(() => {
        deltaMouseClicks.current += 1;
    }, []);

    // -- Feature Extraction (delta-based) --

    const extractDelta = () => {
        const timestamps = keystrokeTimestamps.current;
        const totalKeys = timestamps.length;

        // Average typing speed from all accumulated timestamps
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

        const delta = {
            exam_id: examId,
            submission_id: submissionId || null,
            // Delta counters (ONLY new events since last flush)
            keystroke_count: deltaKeystrokes.current,
            avg_typing_speed: avgTypingSpeed,
            backspace_ratio: backspaceRatio,
            paste_count: deltaPasteCount.current,
            pasted_chars: deltaPastedChars.current,
            tab_switch_count: deltaTabSwitches.current,
            mouse_click_count: deltaMouseClicks.current,
            time_per_question: { ...questionTimes.current },
            events: [...deltaEvents.current],
        };

        // Reset delta counters after extraction
        deltaKeystrokes.current = 0;
        deltaPasteCount.current = 0;
        deltaPastedChars.current = 0;
        deltaTabSwitches.current = 0;
        deltaMouseClicks.current = 0;
        deltaEvents.current = [];
        // Note: keystrokeTimestamps and backspaceCount are NOT reset
        // because avg_typing_speed and backspace_ratio are session-wide metrics.

        return delta;
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

        const delta = extractDelta();

        // Skip flush if there's truly nothing new
        if (
            delta.keystroke_count === 0 &&
            delta.paste_count === 0 &&
            delta.tab_switch_count === 0 &&
            delta.mouse_click_count === 0 &&
            delta.events.length === 0
        ) {
            return;
        }

        try {
            await api.post('/behavior/log', delta);
        } catch {
            // Silently ignore — never disrupt the student's exam experience
        }
    }, [examId, submissionId]);

    // -- Track active question --

    const setCurrentQuestion = useCallback((sectionIdx, questionIdx) => {
        const newKey = `${sectionIdx}-${questionIdx}`;
        if (currentQuestionKey.current && currentQuestionKey.current !== newKey) {
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
        window.addEventListener('blur', handleWindowBlur);
        document.addEventListener('click', handleMouseClick);

        // Flush every 15 seconds
        flushTimer.current = setInterval(flush, 15000);

        return () => {
            isActive.current = false;
            document.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('paste', handlePaste);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('blur', handleWindowBlur);
            document.removeEventListener('click', handleMouseClick);
            clearInterval(flushTimer.current);
        };
    }, [examId, handleKeyDown, handlePaste, handleVisibilityChange, handleWindowBlur, handleMouseClick, flush]);

    return { setCurrentQuestion, flushFinal: flush };
};
