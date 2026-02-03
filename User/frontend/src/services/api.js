import axios from 'axios';

const API_URL = import.meta.env.VITE_USER_API_URL || 'http://localhost:8002';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const getExams = async () => {
    const response = await api.get('/exams/');
    return response.data;
};

export const getExamById = async (id) => {
    const response = await api.get(`/exams/${id}`);
    return response.data;
};

// Submission endpoints
export const submitExam = async (examId, answers) => {
    const response = await api.post(`/exams/${examId}/submit`, { answers });
    return response.data;
};

export const getSubmissionDetails = async (submissionId) => {
    const response = await api.get(`/exams/submissions/${submissionId}`);
    return response.data;
};

export default api;
