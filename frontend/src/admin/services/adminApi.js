import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_ADMIN_API_URL || 'http://localhost:9000/admin/api';

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
    assign: (id, data) => api.post(`/exams/${id}/assign`, data),
    getAssignment: (id) => api.get(`/exams/${id}/assign`),
    getAttemptCount: (id) => api.get(`/exams/${id}/attempt-count`),
};

// Student management
export const studentAPI = {
    getAll: () => api.get('/students'),
    getById: (id) => api.get(`/students/${id}`),
    getSubmissions: (id) => api.get(`/students/${id}/submissions`),
    delete: (id) => api.delete(`/students/${id}`),
    updateStatus: (id, isActive) => api.patch(`/students/${id}/status`, { is_active: isActive }),
    create: (data) => api.post('/students/', data),
};

// Analytics
export const analyticsAPI = {
    getOverview: () => api.get('/analytics/overview'),
    getExamResults: (id) => api.get(`/analytics/exams/${id}/results`),
    getStudentPerformance: (id) => api.get(`/analytics/students/${id}/performance`),
};

// Course management
export const courseAPI = {
    getAll: () => api.get('/courses'),
    getById: (id) => api.get(`/courses/${id}`),
    create: (data) => api.post('/courses', data),
    update: (id, data) => api.put(`/courses/${id}`, data),
    delete: (id) => api.delete(`/courses/${id}`),
};

// Enrollment management
export const enrollmentAPI = {
    getAll: (status) => api.get('/enrollments', { params: status ? { status_filter: status } : {} }),
    approve: (id) => api.post(`/enrollments/${id}/approve`),
    reject: (id) => api.post(`/enrollments/${id}/reject`),
    addStudent: (courseId, userId) => api.post(`/courses/${courseId}/add-student`, { user_id: userId }),
    removeStudent: (courseId, userId) => api.delete(`/courses/${courseId}/remove-student`, { data: { user_id: userId } }),
};

// Student Progress monitoring
export const progressAPI = {
    getOverview: () => api.get('/progress/overview'),
    getStudents: () => api.get('/progress/students'),
    getStudentDetail: (id) => api.get(`/progress/student/${id}`),
};

export default api;
