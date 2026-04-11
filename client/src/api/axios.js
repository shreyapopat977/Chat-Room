import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5000/api',
    withCredentials: true, // Cookies automatically send hogi
});

// Response interceptor — 401 pe auto refresh karo
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const original = error.config;

        // Access token expire hua aur retry nahi kiya abhi tak
        if (error.response?.status === 401 && !original._retry) {
            original._retry = true;

            try {
                await api.post('/auth/refresh'); // New access token cookie milegi
                return api(original);            // Original request dubara bhejo
            } catch {
                // Refresh bhi fail — logout
                window.location.href = '/login';
            }
        }

        return Promise.reject(error);
    }
);

export default api;