import axios from "axios";


const api = axios.create({
  baseURL: "https://collab-sphere-fs.vercel.app/api",
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