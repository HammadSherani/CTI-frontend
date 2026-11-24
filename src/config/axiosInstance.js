// /lib/axios.js
import axios from "axios";
import { isTokenExpired, clearStoredSession, isAuthEndpoint } from "@/helper/authToken";

const axiosInstance = axios.create({
  baseURL:
    process.env.NEXT_PUBLIC_API_URL ||
    "https://tbt-backend-hwu3.onrender.com/api",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Tells the app (AuthListener) that the session is over. It clears the login state; pages that
// need a login (My Account, repairman, admin) send the user to the login page themselves, public
// pages simply continue as a guest. Sent once per expiry, not once per failing request.
let expiryAnnounced = false;
const announceSessionExpired = () => {
  if (typeof window === "undefined" || expiryAnnounced) return;
  expiryAnnounced = true;
  clearStoredSession();
  window.dispatchEvent(new CustomEvent("unauthorized", { detail: { reason: "session_expired" } }));
  setTimeout(() => { expiryAnnounced = false; }, 3000);
};

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      let token = localStorage.getItem("token");
      if (!token) {
        try {
          const authData = localStorage.getItem("auth");
          if (authData) {
            token = JSON.parse(authData)?.token;
          }
        } catch {}
      }
      // Callers often pass the token themselves; never send an expired one
      const callerToken = String(config.headers?.Authorization || "").replace(/^Bearer\s+/i, "");
      const sending = token || callerToken;
      if (sending && sending !== "undefined" && sending !== "null" && isTokenExpired(sending)) {
        delete config.headers.Authorization;
        config._sessionExpired = true;
        announceSessionExpired();
      } else if (token) {
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
    const url = error.config?.url || "";
    const sentToken = Boolean(error.config?.headers?.Authorization) || error.config?._sessionExpired;
    // 401 on a request that carried a login = the session is no longer valid.
    // (401 from login/OTP endpoints means wrong details; a guest's 401 is handled by the caller.)
    if (error.response?.status === 401 && typeof window !== "undefined" && sentToken && !isAuthEndpoint(url)) {
      announceSessionExpired();
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
