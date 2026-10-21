import axios from "axios";

const apiBaseURL = (
  import.meta.env.VITE_API_URL || "http://localhost:3000/api"
).replace(/\/+$/, "");

const api = axios.create({
  baseURL: apiBaseURL,
  withCredentials: true,
});

// Set JSON content type only for non-FormData requests.
api.interceptors.request.use((config) => {
  if (config.data instanceof FormData) {
    delete config.headers["Content-Type"];
  } else if (config.data && !config.headers["Content-Type"]) {
    config.headers["Content-Type"] = "application/json";
  }

  return config;
});

export default api;