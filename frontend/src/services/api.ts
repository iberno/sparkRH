import axios from 'axios';

const api = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const stored = localStorage.getItem('spark-auth');
  if (stored) {
    const { state } = JSON.parse(stored);
    if (state?.token) {
      config.headers.Authorization = `Bearer ${state.token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('spark-auth');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  },
);

export default api;
