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
        // Public account recovery must work even when a browser has an expired
        // JWT. Remove any inherited header without reading browser storage.
        if (config.skipAuth) {
            if (typeof config.headers?.delete === 'function') config.headers.delete('Authorization');
            else if (config.headers) {
                delete config.headers.Authorization;
                delete config.headers.authorization;
            }
            return config;
        }
        const token = localStorage.getItem('token');
        if (token && token !== 'undefined' && token !== 'null') {
            const cleanToken = token.trim().replace(/^"|"$/g, '');
            const bearer = `Bearer ${cleanToken}`;

            if (config.headers && typeof config.headers.set === 'function') {
                config.headers.set('Authorization', bearer);
            }
            if (!config.headers) {
                config.headers = {};
            }
            config.headers.Authorization = bearer;
            config.headers['Authorization'] = bearer;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// ⬅ Response Interceptor: Network/CORS logging
api.interceptors.response.use(
    (response) => {
        if (response.config?.skipAuth) return response;
        // Reuse actual cart responses to keep navigation feedback current without polling.
        const currentToken = localStorage.getItem('token')?.trim().replace(/^"|"$/g, '');
        if (currentToken && response.config?.headers?.Authorization === `Bearer ${currentToken}` &&
            /\/api\/cart(?:\/|\?|$)/.test(response.config?.url || '') && Array.isArray(response.data?.items)) {
            window.dispatchEvent(new CustomEvent('sekkin:cart-updated', { detail: response.data }));
        }
        return response;
    },
    (error) => {
        // Unmount and StrictMode cleanup intentionally cancel requests.
        if (axios.isCancel(error)) return Promise.reject(error);
        if (!error.response) {
            console.error('The store request could not connect.');
        } else if (error.response.status === 401) {
            console.warn('The backend rejected authentication.');
        }
        return Promise.reject(error);
    }
);

export default api;
