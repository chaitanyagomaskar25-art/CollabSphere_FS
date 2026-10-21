import axios from 'axios';

const api = axios.create({
  baseURL: 'https://collab-sphere-fs.vercel.app/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
