import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Custom hook for managing exam timer with warning states
 * @param {string|Date} startTime - Exam start time
 * @param {number} durationMinutes - Exam duration in minutes
 * @param {Function} onTimesUp - Callback when timer reaches zero
 * @returns {Object} Timer state and utilities
 */
export const useExamTimer = (startTime, durationMinutes, onTimesUp) => {
    const [timeLeft, setTimeLeft] = useState(null);
    const [showTimesUpAlert, setShowTimesUpAlert] = useState(false);
    const [hasShownLowTimeWarning, setHasShownLowTimeWarning] = useState(false);
    const warningShownRef = useRef(false);
    const timesUpTriggeredRef = useRef(false);

    const calculateTimeLeft = useCallback(() => {
        if (!startTime) return 0;
        const now = new Date().getTime();
        const start = new Date(startTime).getTime();
        const duration = durationMinutes * 60 * 1000;
        const end = start + duration;
        const remaining = end - now;
        return remaining > 0 ? remaining : 0;
    }, [startTime, durationMinutes]);

    useEffect(() => {
        if (!startTime) return;

        setTimeLeft(calculateTimeLeft());

        const timer = setInterval(() => {
            const remaining = calculateTimeLeft();
            setTimeLeft(remaining);

            // Show low time warning at 5 minutes (once)
            if (remaining <= 5 * 60 * 1000 && remaining > 0 && !warningShownRef.current) {
                warningShownRef.current = true;
                setHasShownLowTimeWarning(true);
            }

            // Handle time's up
            if (remaining <= 0 && !timesUpTriggeredRef.current) {
                timesUpTriggeredRef.current = true;
                clearInterval(timer);
                setShowTimesUpAlert(true);

                // Auto-submit after showing alert for 3 seconds
                setTimeout(() => {
                    setShowTimesUpAlert(false);
                    if (onTimesUp) onTimesUp();
                }, 3000);
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [startTime, calculateTimeLeft, onTimesUp]);

    const formatTime = (milliseconds) => {
        if (milliseconds === null) return "--:--:--";
        const totalSeconds = Math.floor(milliseconds / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    };

    // Determine timer state
    const getTimerState = () => {
        if (timeLeft === null) return 'normal';
        if (timeLeft <= 0) return 'expired';
        if (timeLeft <= 2 * 60 * 1000) return 'critical'; // Last 2 minutes
        if (timeLeft <= 5 * 60 * 1000) return 'warning';  // Last 5 minutes
        return 'normal';
    };

    return {
        timeLeft,
        formattedTime: formatTime(timeLeft),
        isRunning: timeLeft !== null && timeLeft > 0,
        timerState: getTimerState(),
        showTimesUpAlert,
        hasShownLowTimeWarning,
        dismissLowTimeWarning: () => setHasShownLowTimeWarning(false)
    };
};
