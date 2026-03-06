import axios from 'axios';
import { BASE_URL } from './apiPaths';

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 80000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Add a request interceptor to include the token in the headers
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token'); // Get the token from local storage
    if (token) {
      config.headers.Authorization = `Bearer ${token}`; // Include the token in the Authorization header
    }
    return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add a response interceptor to handle errors globally
axiosInstance.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response) {
            // Handle specific status codes (e.g., 401 Unauthorized)
            if (error.response.status === 500) {
                console.error("Internal Server Error:", error.response.data);
            }
            // You can also handle other status codes as needed
        } else if (error.code === 'ECONNABORTED') {
            console.error("Request timed out:", error.message);
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;