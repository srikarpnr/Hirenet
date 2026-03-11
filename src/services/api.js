import axios from 'axios';

const API = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
    headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
API.interceptors.request.use((config) => {
    const token = localStorage.getItem('hirenet-token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

// Auth
export const authAPI = {
    login: (data) => API.post('/auth/login', data),
    register: (data) => API.post('/auth/register', data),
    me: () => API.get('/auth/me'),
};

// Jobs
export const jobsAPI = {
    getAll: (params) => API.get('/jobs', { params }),
    getById: (id) => API.get(`/jobs/${id}`),
    create: (data) => API.post('/jobs', data),
    update: (id, data) => API.put(`/jobs/${id}`, data),
    remove: (id) => API.delete(`/jobs/${id}`),
    getMyJobs: () => API.get('/jobs/manager/my-jobs'),
};

// Applications
export const appsAPI = {
    apply: (data) => API.post('/applications', data),
    getMyApplications: () => API.get('/applications/my'),
    getJobApplications: (jobId) => API.get(`/applications/job/${jobId}`),
    updateStatus: (id, data) => API.patch(`/applications/${id}/status`, data),
    checkApplied: (jobId) => API.get(`/applications/check/${jobId}`),
};

// Manager user management
export const managerAPI = {
    getUsers: () => API.get('/manager/users'),
    updateRole: (id, role) => API.patch(`/manager/users/${id}/role`, { role }),
};

// Admin
export const adminAPI = {
    getStats: () => API.get('/admin/stats'),
    getUsers: () => API.get('/admin/users'),
    deleteUser: (id) => API.delete(`/admin/users/${id}`),
    updateRole: (id, role) => API.patch(`/admin/users/${id}/role`, { role }),
    getAllJobs: () => API.get('/admin/jobs'),
    deleteJob: (id) => API.delete(`/admin/jobs/${id}`),
    getAllApplications: () => API.get('/admin/applications'),
};

export default API;
