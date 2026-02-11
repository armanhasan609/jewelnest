import axios from 'axios';

const BACKEND_URL = 'http://localhost:5000';

const api = axios.create({
    baseURL: BACKEND_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    }
});

// Request interceptor
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['token'] = token;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// --- Auth APIs (Endpoints Fixed) ---

export const loginUser = async (credentials) => {
    try {
        // 'users' ko 'user' kar diya backend match karne ke liye
        const response = await api.post('/api/user/login', credentials);

        if (response.data.success && response.data.token) {
            localStorage.setItem('token', response.data.token);
            if (response.data.user) {
                localStorage.setItem('user', JSON.stringify(response.data.user));
            }
        }
        return response.data;
    } catch (error) {
        console.error("Login API Error:", error.response?.data || error.message);
        throw error;
    }
};

export const registerUser = async (userData) => {
    try {
        const response = await api.post('/api/user/register', userData);
        if (response.data.success && response.data.token) {
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
        }
        return response.data;
    } catch (error) {
        console.error("Registration API Error:", error.response?.data || error.message);
        throw error;
    }
};

export const getProfile = async () => {
    try {
        // Interceptor khud token bhej dega, ab axios.get ki zarurat nahi
        const response = await api.get('/api/user/profile');
        return response.data;
    } catch (error) {
        console.error("Profile Fetch Error:", error.response?.data || error.message);
        throw error;
    }
};

// Admin APIs
export const getAllUsers = async () => {
    try {
        const response = await api.get('/api/user/all');
        return response.data;
    } catch (error) {
        console.error("Get All Users Error:", error.response?.data || error.message);
        throw error;
    }
};

export default api;