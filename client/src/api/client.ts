import axios from 'axios';

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:8080/api/v1',
  headers: { 'Content-Type': 'application/json' },
});

client.interceptors.request.use((config) => {
  const storedUser = localStorage.getItem('pqrs_user');
  if (storedUser) {
    try {
      const user = JSON.parse(storedUser) as { token?: string };
      if (user.token) config.headers.Authorization = `Bearer ${user.token}`;
    } catch {
      localStorage.removeItem('pqrs_user');
    }
  }
  return config;
});

client.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      localStorage.removeItem('pqrs_user');
      if (window.location.pathname !== '/login') window.location.assign('/login');
    }
    return Promise.reject(error);
  },
);

export default client;
