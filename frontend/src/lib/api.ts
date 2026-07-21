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
  async (error) => {
    const originalRequest = error.config;

    // If 401 and not already retried
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const stored = localStorage.getItem('spark-auth');
      if (stored) {
        const { state } = JSON.parse(stored);
        if (state?.refreshToken) {
          try {
            const response = await axios.post('/api/v1/auth/refresh', {
              refresh_token: state.refreshToken,
            });

            const { access_token, refresh_token } = response.data;

            // Update stored tokens
            const updatedState = {
              ...state,
              token: access_token,
              refreshToken: refresh_token,
            };
            localStorage.setItem('spark-auth', JSON.stringify({ state: updatedState }));

            // Retry original request
            originalRequest.headers.Authorization = `Bearer ${access_token}`;
            return api(originalRequest);
          } catch {
            // Refresh failed, logout
            localStorage.removeItem('spark-auth');
            window.location.href = '/login';
          }
        } else {
          // No refresh token, logout
          localStorage.removeItem('spark-auth');
          window.location.href = '/login';
        }
      }
    }

    return Promise.reject(error);
  },
);

export default api;
