import axios from 'axios';

// Creates a pre-configured axios instance.
// Every request automatically goes to the right base URL,
// and every request automatically includes the auth token.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
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