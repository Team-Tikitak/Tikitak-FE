import axios from 'axios';
import { PATHS } from '@/app/routes/paths';
import { useAuthStore } from '../stores/authStore';

export const instance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

const accessToken: string | null = null;
export const getAccessToken = () => useAuthStore.getState().accessToken;
export const setAccessToken = (token: string) => {
  useAuthStore.getState().setAccessToken(token);
};
export const clearAccessToken = () => {
  useAuthStore.getState().clearAccessToken();
};

instance.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

let isRefreshing = false;
let pendingQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];
const processQueue = (error: unknown, token?: string) => {
  pendingQueue.forEach(({ resolve, reject }) => {
    if (token) resolve(token);
    else reject(error);
  });

  pendingQueue = [];
};

instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status;
    const originalRequest = error.config;

    if (!status) return Promise.reject(error);

    if (status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          pendingQueue.push({
            resolve: (token) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              resolve(instance(originalRequest));
            },
            reject,
          });
        });
      }

      isRefreshing = true;

      try {
        const { data } = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/api/v1/auth/token/refresh`,
          null,
          { withCredentials: true },
        );

        const newAccessToken = data.data?.accessToken;

        if (!newAccessToken) throw new Error('Access token not found');

        setAccessToken(newAccessToken);
        processQueue(null, newAccessToken);

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        return instance(originalRequest);
      } catch (refreshError) {
        clearAccessToken();
        processQueue(refreshError);
        window.location.replace(PATHS.LOGIN);

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);
