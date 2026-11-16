import axios from "axios";
import { clearSession, getSessionToken } from "../utils/session.js";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "/api",
  headers: { "Content-Type": "application/json" },
  timeout: 15000
});

api.interceptors.request.use((config) => {
  const token = getSessionToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && error.config?.headers?.Authorization) {
      clearSession();
      window.dispatchEvent(new Event("clinicflow:unauthorized"));
    }
    return Promise.reject(error);
  }
);

export default api;
