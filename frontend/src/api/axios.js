import axios from 'axios';

// Base URL for Django backend
const API = axios.create({
    baseURL:'https://library-management-system-v2y6.vercel.app/api',,
});

// Automatically add JWT token to every request
API.interceptors.request.use((config) => {
    const token = localStorage.getItem('access');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Automatically refresh token if expired
API.interceptors.response.use(
    (response) => response,
    async (error) => {
        const original = error.config;
        if (error.response?.status === 401 && !original._retry) {
            original._retry = true;
            try {
                const refresh = localStorage.getItem('refresh');
                const res = await axios.post(
                    'https://library-management-system-v2y6.vercel.app/api/students/token/refresh/',,
                    { refresh }
                );
                localStorage.setItem('access', res.data.access);
                original.headers.Authorization = `Bearer ${res.data.access}`;
                return API(original);
            } catch (err) {
                localStorage.clear();
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default API;