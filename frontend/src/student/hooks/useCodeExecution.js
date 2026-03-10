import { useState } from 'react';
import { executeCode } from '../services/api';

export const useCodeExecution = (initialLanguageId = 71) => {
    const [code, setCode] = useState("");
    const [languageId, setLanguageId] = useState(initialLanguageId);
    const [output, setOutput] = useState("");
    const [isExecuting, setIsExecuting] = useState(false);
    const [testCaseResults, setTestCaseResults] = useState([]);

    const runTestCase = async (testCase) => {
        try {
            const result = await executeCode(code, languageId, testCase.input, testCase.output);
            return result;
        } catch (error) {
            console.error(error);
            return {
                input: testCase.input,
                expected: testCase.output,
                actual: "",
                passed: false,
                status: "Error",
                error: error.response?.data?.detail || error.message || "Failed to execute"
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
