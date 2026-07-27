// /lib/axios.js
import axios from "axios";

const axiosInstance = axios.create({
  baseURL:
    process.env.NEXT_PUBLIC_API_URL ||
    "https://tbt-backend-hwu3.onrender.com/api",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor (NO STORE HERE)
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // If it's a 401 but the endpoint is /login, do not dispatch the unauthorized redirect.
    const isLoginEndpoint = error.config?.url?.includes('/login');

    if (error.response?.status === 401 && typeof window !== "undefined" && !isLoginEndpoint) {
      localStorage.removeItem("token");

      // 🔔 only event dispatch
      window.dispatchEvent(
        new CustomEvent("unauthorized", {
          detail: { redirect: "/auth/login" },
        })
      );
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
