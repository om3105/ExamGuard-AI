import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_ADMIN_API_URL || 'http://localhost:8000/admin/api';

// Create axios instance with default config
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add token to requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('adminToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Auth endpoints
export const adminAuth = {
    login: (credentials) => api.post('/auth/login', credentials),
    logout: () => api.post('/auth/logout'),
    getMe: () => api.get('/auth/me'),
    createAdmin: (data) => api.post('/auth/register', data),
};

// Exam management
export const examAPI = {
    getAll: () => api.get('/exams'),
    getById: (id) => api.get(`/exams/${id}`),
    create: (data) => api.post('/exams', data),
    update: (id, data) => api.put(`/exams/${id}`, data),
    delete: (id) => api.delete(`/exams/${id}`),
    getSubmissions: (id) => api.get(`/exams/${id}/submissions`),
};

// Student management
export const studentAPI = {
    getAll: () => api.get('/students'),
    getById: (id) => api.get(`/students/${id}`),
    getSubmissions: (id) => api.get(`/students/${id}/submissions`),
    delete: (id) => api.delete(`/students/${id}`),
};

// Analytics
export const analyticsAPI = {
    getOverview: () => api.get('/analytics/overview'),
    getExamResults: (id) => api.get(`/analytics/exams/${id}/results`),
    getStudentPerformance: (id) => api.get(`/analytics/students/${id}/performance`),
};

export default api;
