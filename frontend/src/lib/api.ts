import axios from 'axios';

const api = axios.create({
    baseURL: (process.env.NEXT_PUBLIC_API_URL || 'https://technnext-hrms-backend.onrender.com') + '/v1',
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use(
    (config) => {
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('token');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            const reqUrl = error.config?.url || '';
            const isAuthEndpoint =
                reqUrl.includes('/auth/login') ||
                reqUrl.includes('/auth/register') ||
                reqUrl.includes('/auth/forgot-password') ||
                reqUrl.includes('/auth/reset-password');
            if (typeof window !== 'undefined' && !isAuthEndpoint) {
                const token = localStorage.getItem('token');
                if (token) {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    window.location.href = '/login';
                }
            }
        }
        return Promise.reject(error);
    }
);

export default api;
