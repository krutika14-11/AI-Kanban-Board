import axios, { AxiosError } from 'axios';
import toast from 'react-hot-toast';

const BASE_URL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : '/api';

export const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 120000,
});

// Response interceptor - unwrap data
api.interceptors.response.use(
  response => response,
  (error: AxiosError<{ error?: string }>) => {
    const message = error.response?.data?.error ?? error.message ?? 'An error occurred';

    if (error.response?.status !== 404) {
      toast.error(message);
    }

    return Promise.reject(new Error(message));
  }
);

export default api;
