// /lib/axios.js
import axios from "axios";

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "https://api.example.com",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Optional: Add interceptors
axiosInstance.interceptors.request.use(
  (config) => {
    // Add token if available
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 errors globally
    if (error.response?.status === 401) {
      console.error("Unauthorized - Redirecting to login");
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
