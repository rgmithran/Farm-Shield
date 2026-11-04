import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Automatically attach Bearer token to all requests if present
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Graceful 401 handling so expired/corrupt tokens don't trap users in token errors
let onUnauthorizedCallback = null;
export const setOnUnauthorizedCallback = (callback) => {
  onUnauthorizedCallback = callback;
};

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('userEmail');
      localStorage.removeItem('userRole');
      if (onUnauthorizedCallback) {
        onUnauthorizedCallback();
      }
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  login: (credentials) => api.post('/api/auth/login', credentials),
  register: (credentials) => api.post('/api/auth/register', credentials),
  getHistory: () => api.get('/api/auth/history'),
  getAdminOverview: () => api.get('/api/auth/admin/overview'),
};

export const cropApi = {
  getRecommendations: (data) => api.post('/api/crops/recommend', data),
  getAll: (params) => api.get('/api/crops', { params }),
  getById: (id) => api.get(`/api/crops/${id}`),
  create: (cropData) => api.post('/api/crops', cropData),
  update: (id, cropData) => api.put(`/api/crops/${id}`, cropData),
  delete: (id) => api.delete(`/api/crops/${id}`),
};

export const diseaseApi = {
  detectDisease: (formData) =>
    api.post('/api/disease/detect', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  getCatalog: () => api.get('/api/disease/catalog'),
};

export const weatherApi = {
  getForecast: (location) => api.get(`/api/weather/forecast?location=${encodeURIComponent(location)}`),
  getDistricts: () => api.get('/api/weather/districts'),
};

export const ledgerApi = {
  getEntries: () => api.get('/api/auth/ledger'),
  addEntry: (entryData) => api.post('/api/auth/ledger', entryData),
  deleteEntry: (id) => api.delete(`/api/auth/ledger/${id}`),
};

export const forumApi = {
  getAll: (params) => api.get('/api/forum', { params }),
  create: (postData) => api.post('/api/forum', postData),
  reply: (id, replyData) => api.post(`/api/forum/${id}/reply`, replyData),
  like: (id) => api.post(`/api/forum/${id}/like`),
  delete: (id) => api.delete(`/api/forum/${id}`),
};

export default api;
