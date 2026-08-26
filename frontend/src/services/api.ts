import axios, { AxiosError } from 'axios';
import toast from 'react-hot-toast';

export const api = axios.create({
  baseURL: '/api',
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
