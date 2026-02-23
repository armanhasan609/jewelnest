import API from './api'; // Jo axios.create wala instance hai

// 1. Login User
export const loginUser = async (credentials) => {
    try {
        // Dhyaan dein: Hum '/api/user/login' use kar rahe hain taaki 404 na aaye
        const response = await API.post('/api/user/login', credentials);
        return response.data;
    } catch (error) {
        console.error("Login Error:", error.response?.data || error.message);
        throw error;
    }
};

// 2. Register User
export const registerUser = async (userData) => {
    try {
        // Sab jagah API instance use karein taaki consistency rahe
        const response = await API.post('/api/user/register', userData);
        console.log('Registration successful:', response.data);
        return response.data;
    } catch (error) {
        // Return structured error response instead of throwing to let UI handle it gracefully
        if (error.response && error.response.data) {
            return error.response.data;
        }
        console.error("Registration Error:", error.message);
        throw error;
    }
};

// 3. Get Profile (Sabse Best Approach)
export const getProfile = async () => {
    try {
        // Isme token pass karne ki zarurat nahi, interceptor localStorage se khud utha lega
        const response = await API.get('/api/user/profile');
        return response.data;
    } catch (error) {
        console.error("Profile API Error:", error.response?.data || error.message);
        throw error;
    }
};