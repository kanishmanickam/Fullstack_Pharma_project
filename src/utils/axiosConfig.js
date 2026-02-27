import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const axiosInstance = axios.create({
  baseURL: API_BASE,
});

// Request interceptor to attach token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('medistock_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle 401 (unauthorized) globally
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token expired or invalid
      // We can trigger a logout event here, but typically we handle that in AuthContext
      // For now, just remove the token if it's strictly a 401 from protected routes
      if (localStorage.getItem('medistock_token')) {
        console.error("Authentication expired or invalid. Please login again.");
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
