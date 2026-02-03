import axios from 'axios';

import axios from 'axios';


const api = axios.create({
    baseURL: import.meta.env.VITE_USER_API_URL || 'http://localhost:8002',
    headers: {
        "Content-Type": "application/json",
    },
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const submitCode = async (sourceCode, languageId, stdin = "") => {
    try {
        const response = await api.post("/exams/execute", {
            source_code: sourceCode,
            language_id: languageId,
            stdin: stdin
        });
        // Backend returns result directly
        return response.data;
    } catch (error) {
        console.error("Code Execution Error:", error);
        throw error;
    }
};

// With backend proxy, we get result immediately, so we mock this or remove it.
// The hook expects a token, but we return result. We need to update hook too.
// Actually, let's keep the signature but adapt behavior.
// If we return the result object directly from submitCode, the hook needs to handle it.
// Let's look at the hook again. It expects a token and then polls.
// We should update the hook to just await submitCode if it returns result.


// Common Language IDs in Judge0
export const LANGUAGE_OPTIONS = [
    { id: 71, name: "Python (3.8.1)", label: "Python 3" },
    { id: 62, name: "Java (OpenJDK 13.0.1)", label: "Java" },
    { id: 50, name: "C (GCC 9.2.0)", label: "C" },
    { id: 54, name: "C++ (GCC 9.2.0)", label: "C++" },
    { id: 63, name: "JavaScript (Node.js 12.14.0)", label: "JavaScript" },
];
