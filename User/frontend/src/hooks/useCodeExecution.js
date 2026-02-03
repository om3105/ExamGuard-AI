import { useState, useEffect } from 'react';
import { submitCode } from '../services/judge0';

export const useCodeExecution = (initialLanguageId = 71) => {
    const [code, setCode] = useState("");
    const [languageId, setLanguageId] = useState(initialLanguageId);
    const [output, setOutput] = useState("");
    const [isExecuting, setIsExecuting] = useState(false);
    const [testCaseResults, setTestCaseResults] = useState([]);

    const runTestCase = async (testCase) => {
        try {
            // submitCode now calls backend which returns the result directly
            const result = await submitCode(code, languageId, testCase.input);

            // Backend should return standard structure or Judge0 structure.
            // Our Execute Service returns Judge0 structure: stdout, etc.

            // Normalizing output: trim whitespace and newlines for comparison
            const actualOutput = (result.stdout || "").trim();
            const expectedOutput = (testCase.output || "").trim();
            const passed = actualOutput === expectedOutput;

            return {
                input: testCase.input,
                expected: testCase.output,
                actual: actualOutput,
                passed: passed,
                status: result.status?.description || "Completed",
                error: result.stderr || result.compile_output
            };
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
