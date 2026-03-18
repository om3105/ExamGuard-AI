/**
 * ServerWakingOverlay — Full-screen overlay shown when the Render backend is cold-starting.
 *
 * Subscribes to the global serverStatus singleton.
 * Shows an animated spinner + contextual message during retries.
 * Auto-dismisses when the server responds.
 */

import React, { useState, useEffect } from 'react';
import serverStatus from '../lib/serverStatus';

const ServerWakingOverlay = () => {
  const [status, setStatus] = useState({
    isWaking: serverStatus.isWaking,
    retryCount: serverStatus.retryCount,
  });

  useEffect(() => {
    const unsubscribe = serverStatus.subscribe(setStatus);
    return unsubscribe;
  }, []);

  if (!status.isWaking) return null;

  const messages = [
    'Starting server, please wait…',
    'Still connecting… almost there…',
    'Server is waking up, hang tight…',
  ];

  const message = messages[Math.min(status.retryCount, messages.length - 1)];

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      style={{ backgroundColor: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(4px)' }}
    >
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full mx-4 text-center">
        {/* Animated spinner */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="w-16 h-16 rounded-full border-4 border-blue-100"></div>
            <div
              className="absolute top-0 left-0 w-16 h-16 rounded-full border-4 border-transparent border-t-blue-600 animate-spin"
            ></div>
          </div>
        </div>

        {/* Status message */}
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Connecting to Server
        </h3>
        <p className="text-sm text-gray-500 mb-4">
          {message}
        </p>

        {/* Progress dots */}
        <div className="flex justify-center gap-1.5">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-blue-500"
              style={{
                animation: 'pulse 1.4s ease-in-out infinite',
                animationDelay: `${i * 0.2}s`,
                opacity: 0.3,
              }}
            ></div>
          ))}
        </div>

        <p className="text-xs text-gray-400 mt-4">
          Our server runs on a free tier and may take a moment to start.
        </p>
      </div>

      {/* Keyframe for pulsing dots */}
      <style>{`
        @keyframes pulse {
          0%, 80%, 100% { opacity: 0.3; transform: scale(0.8); }
          40% { opacity: 1; transform: scale(1.2); }
        }
      `}</style>
    </div>
  );
};

export default ServerWakingOverlay;
