import axios, { AxiosError } from 'axios';
import toast from 'react-hot-toast';

const configuredApiUrl = import.meta.env.VITE_API_URL?.trim().replace(/\/+$/, '');

// Accept both `https://api.example.com` and `https://api.example.com/api`.
// The latter is a common Netlify environment-variable value; appending `/api`
// unconditionally turns it into a failing `/api/api` request.
const BASE_URL = configuredApiUrl
  ? configuredApiUrl.endsWith('/api') ? configuredApiUrl : `${configuredApiUrl}/api`
  : '/api';

export const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 120000,
});

// Response interceptor - unwrap data
api.interceptors.response.use(
  response => {
    // A static Netlify deployment returns index.html for an unconfigured `/api`
    // request. Treat it as an API error instead of passing HTML to page code that
    // expects JSON, which otherwise results in a blank/crashed project page.
    const contentType = String(response.headers['content-type'] ?? '');
    if (typeof response.data === 'string' && contentType.includes('text/html')) {
      return Promise.reject(new Error(
        'API is not configured. Set VITE_API_URL in Netlify to your deployed backend URL.'
      ));
    }

    return response;
  },
  (error: AxiosError<{ error?: string }>) => {
    const message = error.response?.data?.error ?? error.message ?? 'An error occurred';

    if (error.response?.status !== 404) {
      toast.error(message);
    }

    return Promise.reject(new Error(message));
  }
);

export default api;
