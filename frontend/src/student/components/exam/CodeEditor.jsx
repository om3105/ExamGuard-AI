import React from 'react';

const LANGUAGE_OPTIONS = [
    { id: 71, name: 'Python (3.8.1)' },
    { id: 62, name: 'Java (OpenJDK 13.0.1)' },
    { id: 54, name: 'C++ (GCC 9.2.0)' },
    { id: 63, name: 'JavaScript (Node.js 12.14.0)' },
    { id: 50, name: 'C (GCC 9.2.0)' }
];

const CodeEditor = ({
    code,
    setCode,
    languageId,
    setLanguageId,
    isRunning,
    handleRunCode,
    testCaseResults
}) => {
    return (
        <div>
            <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
                <div className="flex justify-between items-center mb-3">
                    <label className="block text-sm font-semibold text-gray-700">Code Editor</label>
                    <select
                        value={languageId}
                        onChange={(e) => setLanguageId(Number(e.target.value))}
                        className="px-3 py-1.5 border rounded text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    >
                        {LANGUAGE_OPTIONS.map(lang => (
                            <option key={lang.id} value={lang.id}>{lang.name}</option>
                        ))}
                    </select>
                </div>
                <textarea
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full h-80 p-4 font-mono text-sm border rounded bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    placeholder="Write your code here..."
                    spellCheck="false"
                />
                <button
                    onClick={handleRunCode}
                    disabled={isRunning}
                    className="mt-3 px-6 py-2 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors focus:ring-2 focus:ring-blue-400 focus:outline-none"
                >
                    {isRunning ? 'Running...' : 'Run Code'}
                </button>
            </div>

            {/* Test Results */}
            {testCaseResults.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
                    <h3 className="font-semibold text-gray-900 mb-3">Test Results:</h3>
                    <div className="space-y-3">
                        {testCaseResults.map((result, idx) => (
                            <div
                                key={idx}
                                className={`p-4 rounded-lg border-2 ${result.passed
                                    ? 'bg-green-50 border-green-200'
                                    : 'bg-red-50 border-red-200'
                                    }`}
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <span className="font-semibold text-sm">
                                        Test Case {idx + 1}
                                    </span>
                                    <span
                                        className={`px-3 py-1 rounded-full text-xs font-bold ${result.passed
                                            ? 'bg-green-200 text-green-800'
                                            : 'bg-red-200 text-red-800'
                                            }`}
                                    >
                                        {result.passed ? '✓ Passed' : '✗ Failed'}
                                    </span>
                                </div>
                                <div className="text-xs space-y-1 font-mono">
                                    <div>
                                        <span className="text-gray-600">Input:</span>{' '}
                                        <span className="text-gray-900">{result.input}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">Expected:</span>{' '}
                                        <span className="text-gray-900">{result.expected}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">Actual:</span>{' '}
                                        <span className="text-gray-900">
                                            {result.actual !== undefined && result.actual !== null 
                                                ? (result.actual === "" ? <span className="text-gray-400 italic">{'<empty>'}</span> : result.actual) 
                                                : 'No output'}
                                        </span>
                                    </div>
                                    {result.error && (
                                        <div className="text-red-600 mt-2">
                                            <span className="font-semibold">Error:</span> {result.error}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default CodeEditor;
