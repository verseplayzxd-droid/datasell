import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://datasell-backend.onrender.com';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: { 'Content-Type': 'application/json' },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('datasell_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('datasell_token');
      localStorage.removeItem('datasell_user');
      if (!window.location.pathname.startsWith('/admin')) {
        window.location.href = '/auth';
      }
    }
    return Promise.reject(error);
  }
);

export default api;

// Admin API instance
export const adminApi = axios.create({
  baseURL: `${API_URL}/api/admin`,
  headers: { 'Content-Type': 'application/json' },
});

adminApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('datasell_admin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

adminApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && window.location.pathname.startsWith('/admin')) {
      localStorage.removeItem('datasell_admin_token');
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);
