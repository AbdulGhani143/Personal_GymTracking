import axios from "axios";

const defaultBaseUrl = import.meta.env.PROD ? "" : "http://localhost:5000";
const baseURL = typeof import.meta.env.VITE_API_BASE_URL === "string" 
  ? import.meta.env.VITE_API_BASE_URL 
  : defaultBaseUrl;

const api = axios.create({
  baseURL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
