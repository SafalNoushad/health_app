// src/api/axiosInstance.js
import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:5002/api', // Adjust the baseURL as needed
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token'); // Token saved during login
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosInstance;
