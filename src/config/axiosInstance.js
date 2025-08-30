// /lib/axios.js
import axios from "axios";
import store from "../store";
import { clearAuth } from "../store/auth";

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "https://tbt-backend-hwu3.onrender.com/api",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error("Unauthorized - Redirecting to login");
      // Clear Redux auth state
      store.dispatch(clearAuth());
      // Clear token from localStorage
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        // Dispatch custom event for 401 error
        const event = new CustomEvent("unauthorized", { detail: { redirect: "/auth/login" } });
        window.dispatchEvent(event);
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;