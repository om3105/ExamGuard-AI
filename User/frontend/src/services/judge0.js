import axios from 'axios';

const JUDGE0_API_URL = import.meta.env.VITE_JUDGE0_API_URL || "https://ce.judge0.com"; // Default to CE Demo (Subject to Rate Limits)
// For robust usage, use your own instance or RapidAPI: 
// const JUDGE0_API_URL = "https://judge0-ce.p.rapidapi.com";

const api = axios.create({
    baseURL: JUDGE0_API_URL,
    headers: {
        "Content-Type": "application/json",
        // "X-RapidAPI-Key": "YOUR_API_KEY", // Uncomment and add key if using RapidAPI
        // "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com"
    },
});

export const submitCode = async (sourceCode, languageId, stdin = "") => {
    try {
        const response = await api.post("/submissions", {
            source_code: sourceCode,
            language_id: languageId,
            stdin: stdin,
            base64_encoded: false,
            wait: false, // Async submission
        });
        return response.data.token;
    } catch (error) {
        console.error("Judge0 Submission Error:", error);
        throw error;
    }
};

export const getSubmissionResult = async (token) => {
    try {
        const response = await api.get(`/submissions/${token}?base64_encoded=false&fields=stdout,stderr,status,compile_output,time,memory`);
        return response.data;
    } catch (error) {
        console.error("Judge0 Result Error:", error);
        throw error;
    }
};

// Common Language IDs in Judge0
export const LANGUAGE_OPTIONS = [
    { id: 71, name: "Python (3.8.1)", label: "Python 3" },
    { id: 62, name: "Java (OpenJDK 13.0.1)", label: "Java" },
    { id: 50, name: "C (GCC 9.2.0)", label: "C" },
    { id: 54, name: "C++ (GCC 9.2.0)", label: "C++" },
    { id: 63, name: "JavaScript (Node.js 12.14.0)", label: "JavaScript" },
];
