import axios from 'axios';
import { API_BASE_URL } from '../constants';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
  withCredentials: true, // Send httpOnly cookies with every request
});

apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message =
      error.response?.data?.error ||
      error.response?.data?.message ||
      (error.response?.status === 404
        ? 'Resource not found'
        : error.response?.status === 401
        ? 'Authentication required or invalid credentials'
        : error.response?.status === 403
        ? 'Access denied'
        : error.message || 'An unexpected network error occurred');

    const err = new Error(message);
    err.status = error.response?.status;
    err.data = error.response?.data;
    return Promise.reject(err);
  }
);

export default apiClient;
