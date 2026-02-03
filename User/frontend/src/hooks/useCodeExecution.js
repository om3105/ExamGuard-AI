import { useState, useEffect } from 'react';
import { submitCode, getSubmissionResult } from '../services/judge0';

export const useCodeExecution = (initialLanguageId = 71) => {
    const [code, setCode] = useState("");
    const [languageId, setLanguageId] = useState(initialLanguageId);
    const [output, setOutput] = useState("");
    const [isExecuting, setIsExecuting] = useState(false);
    const [testCaseResults, setTestCaseResults] = useState([]);

    const runTestCase = async (testCase) => {
        try {
            const token = await submitCode(code, languageId, testCase.input);
            return new Promise((resolve, reject) => {
                const interval = setInterval(async () => {
                    try {
                        const result = await getSubmissionResult(token);
                        if (result.status.id >= 3) {
                            clearInterval(interval);

                            // Normalizing output: trim whitespace and newlines for comparison
                            const actualOutput = (result.stdout || "").trim();
                            const expectedOutput = (testCase.output || "").trim();
                            const passed = actualOutput === expectedOutput;

                            resolve({
                                input: testCase.input,
                                expected: testCase.output,
                                actual: actualOutput,
                                passed: passed,
                                status: result.status.description,
                                error: result.stderr || result.compile_output
                            });
                        }
                    } catch (err) {
                        clearInterval(interval);
                        reject(err);
                    }
                }, 1000);
            });
        } catch (error) {
            return {
                input: testCase.input,
                expected: testCase.output,
                actual: "",
                passed: false,
                status: "Error",
                error: error.message
            };
        }
    };

    const runCode = async (testCases) => {
        if (!code.trim()) {
            alert("Please write some code before running");
            return;
        }

        setIsExecuting(true);
        setOutput("Running code...");
        setTestCaseResults([]);

        const results = [];

        for (const testCase of testCases) {
            const result = await runTestCase(testCase);
            results.push(result);
        }

        setTestCaseResults(results);
        setIsExecuting(false);
        setOutput("Test cases executed. See results below.");
    };

    const clearCode = () => {
        setCode("");
        setTestCaseResults([]);
        setOutput("");
    };

    return {
        code,
        setCode,
        languageId,
        setLanguageId,
        output,
        isExecuting,
        testCaseResults,
        runCode,
        clearCode
    };
};
