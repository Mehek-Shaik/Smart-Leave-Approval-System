import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: attach token safely
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('smart_leave_jwt');
    if (token && token !== 'null' && token !== 'undefined' && config.headers) {
      config.headers.Authorization = `Bearer ${token.trim()}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const isLoginRequest = error.config?.url?.includes('/login');
      if (!isLoginRequest) {
        console.warn('Session expired or unauthorized request (401). Clearing stale local session.');
        localStorage.removeItem('smart_leave_jwt');
        localStorage.removeItem('smart_leave_user');
        window.dispatchEvent(new CustomEvent('auth:unauthorized', { detail: error.response?.data }));
      }
    }
    return Promise.reject(error);
  }
);

export default api;
