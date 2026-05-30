import axios from 'axios';

// Vite replaces import.meta.env.VITE_API_URL at build time.
// The hardcoded fallback ensures the app works on Render even if
// the env variable is not set during the build.
const API_URL = import.meta.env.VITE_API_URL
  || 'https://grade-management-system-backend-mukm.onrender.com/api';

const api = axios.create({
  baseURL: API_URL,
});

// REQUEST INTERCEPTOR
// Runs before every request is sent.
// Reads the JWT from localStorage and adds it to the Authorization header.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// RESPONSE INTERCEPTOR
// Runs after every response comes back.
// If the server returns 401 (unauthorized), clear storage and redirect to login.
// This handles expired tokens automatically across the whole app.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;