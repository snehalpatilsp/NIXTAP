import axios from 'axios';
import {
  identifyServiceFromUrl,
  recordServiceSuccess,
  recordServiceFailure,
} from './circuitBreaker';

const api = axios.create({
  // Fix 14: use relative base URL so all requests go through the Vite proxy in dev.
  // The proxy (vite.config.js) forwards /api/** → http://localhost:8080/api/**
  // In production, set VITE_API_BASE_URL env var or configure a real reverse proxy.
  baseURL: import.meta.env.VITE_API_BASE_URL || '',
  headers: {
    'Content-Type': 'application/json',
  },
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Request Interceptor: Read accessToken from localStorage and inject Bearer header
api.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
      config.headers['Authorization'] = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Handle 401 Unauthorized, Circuit Breaker telemetry, & refresh token flow
api.interceptors.response.use(
  (response) => {
    const serviceName = identifyServiceFromUrl(response.config?.url);
    recordServiceSuccess(serviceName);
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    const serviceName = identifyServiceFromUrl(originalRequest?.url);
    const status = error.response?.status;

    recordServiceFailure(serviceName, status);

    if (error.response && status === 401 && !originalRequest._retry) {
      // Do not attempt refresh on auth endpoints to prevent loops
      if (
        originalRequest.url?.includes('/api/v1/auth/login') ||
        originalRequest.url?.includes('/api/v1/auth/register') ||
        originalRequest.url?.includes('/api/v1/auth/refresh')
      ) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers['Authorization'] = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem('refreshToken');

      if (!refreshToken) {
        isRefreshing = false;
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(error);
      }

      try {
        const response = await axios.post(
          (import.meta.env.VITE_API_BASE_URL || '') + '/api/v1/auth/refresh',
          { refreshToken: refreshToken }
        );

        // Parse refreshed tokens from response wrapper res.data.data
        const newAccessToken = response.data?.data?.accessToken;
        const newRefreshToken = response.data?.data?.refreshToken;

        if (newAccessToken && newRefreshToken) {
          localStorage.setItem('accessToken', newAccessToken);
          localStorage.setItem('refreshToken', newRefreshToken);

          api.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
          originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;

          processQueue(null, newAccessToken);
          isRefreshing = false;
          return api(originalRequest);
        } else {
          throw new Error('Refreshed token not found in response');
        }
      } catch (refreshError) {
        processQueue(refreshError, null);
        isRefreshing = false;
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
