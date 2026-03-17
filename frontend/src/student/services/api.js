import axios from 'axios';

const API_URL = import.meta.env.VITE_USER_API_URL || 'http://localhost:9000';

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
export const startExam = async (examId) => {
    const response = await api.post(`/exams/${examId}/start`);
    return response.data;
};

export const submitExam = async (examId, answers, submissionId) => {
    const response = await api.post(`/exams/${examId}/submit${submissionId ? `?submission_id=${submissionId}` : ''}`, { answers });
    return response.data;
};

export const getSubmissionDetails = async (submissionId) => {
    const response = await api.get(`/exams/submissions/${submissionId}`);
    return response.data;
};

// Profile endpoints
export const getStudentProfile = async () => {
    const response = await api.get('/student/profile/');
    return response.data;
};

export const updateStudentProfile = async (data) => {
    const response = await api.put('/student/profile/update', data);
    return response.data;
};

export const executeCode = async (sourceCode, languageId, stdin, expectedOutput) => {
    const response = await api.post(`/exams/execute`, {
        source_code: sourceCode,
        language_id: languageId,
        stdin: stdin || "",
        expected_output: expectedOutput || ""
    });
    return response.data;
};

// Course Endpoints
export const getCourses = async () => {
    const response = await api.get('/courses/');
    return response.data;
};

export const getCourseById = async (courseId) => {
    const response = await api.get(`/courses/${courseId}`);
    return response.data;
};

export const enrollInCourse = async (courseId) => {
    const response = await api.post(`/courses/${courseId}/enroll`);
    return response.data;
};

export const requestEnrollment = async (courseId) => {
    const response = await api.post(`/courses/${courseId}/request-enrollment`);
    return response.data;
};

// Course Progress
export const getCourseProgress = async (courseId) => {
    const response = await api.get(`/courses/${courseId}/progress`);
    return response.data;
};

export const markLessonComplete = async (courseId, lessonId) => {
    const response = await api.post(`/courses/${courseId}/lessons/${lessonId}/complete`);
    return response.data;
};

export const submitCourseQuiz = async (courseId, quizId, answers) => {
    const response = await api.post(`/courses/${courseId}/quiz/${quizId}/submit`, { answers });
    return response.data;
};

export default api;
