import axios from 'axios';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://sekkin-lk-backend.onrender.com';
export const API = `${API_BASE_URL}/api`;

/**
 * Product / media image URL resolve කිරීම.
 * Backend localhost URLs → hosted Render URL වෙත convert කරයි.
 * Relative /uploads/ paths → full URL කරයි.
 */
export const resolveImageUrl = (imgUrl) => {
    if (!imgUrl || typeof imgUrl !== 'string') return '';
    if (imgUrl.startsWith('http://localhost:8080')) {
        return imgUrl.replace('http://localhost:8080', API_BASE_URL);
    }
    if (imgUrl.startsWith('http://127.0.0.1:8080')) {
        return imgUrl.replace('http://127.0.0.1:8080', API_BASE_URL);
    }
    if (imgUrl.startsWith('/uploads/')) {
        return `${API_BASE_URL}${imgUrl}`;
    }
    return imgUrl;
};

// Axios instance — සෑම request එකටම base URL set
const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000, // 30s — Render free tier cold start සඳහා
    headers: { 'Content-Type': 'application/json' },
});

// ➡ Request Interceptor: සෑම request එකටම Token auto-attach
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// ➡ Response Interceptor: 401 (Unauthorized) → Login page redirect
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;