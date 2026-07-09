import axios from 'axios';
import { PATHS } from '@/app/routes/paths';
import { invalidateDeviceToken } from '@/shared/lib/native/getDeviceToken';
import { saveRedirectAfterLogin } from '@/shared/lib/routing/redirectAfterLogin';
import { useAuthStore } from '../stores/authStore';
import { AUTH_ENDPOINTS } from './auth/endpoints';

export const instance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

export const publicInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

export const getAccessToken = () => useAuthStore.getState().accessToken;
export const setAccessToken = (token: string) => {
  useAuthStore.getState().setAccessToken(token);
};
export const clearAccessToken = () => {
  useAuthStore.getState().clearAccessToken();
};
export const startLogout = () => {
  useAuthStore.getState().startLogout();
};
export const endLogout = () => {
  useAuthStore.getState().endLogout();
};

const AUTH_HEADER_EXCLUDED_PATHS = [
  AUTH_ENDPOINTS.OAUTH_PREFIX,
  AUTH_ENDPOINTS.TOKEN_REFRESH,
] as const;
const REFRESH_RETRY_EXCLUDED_PATHS = [
  AUTH_ENDPOINTS.OAUTH_PREFIX,
  AUTH_ENDPOINTS.TOKEN_REFRESH,
  AUTH_ENDPOINTS.LOGOUT,
] as const;
const isPathExcluded = (url: string | undefined, paths: readonly string[]) => {
  if (!url) return false;
  return paths.some((path) => url.startsWith(path));
};

instance.interceptors.request.use((config) => {
  if (isPathExcluded(config.url, AUTH_HEADER_EXCLUDED_PATHS)) {
    return config;
  }
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
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

// 세션 복구(restoreSession)와 라우트 로더(ensureAuthenticatedForLoader)도 이 함수를 거쳐야
// 인터셉터의 401 재시도와 동시에 refresh를 쏘지 않는다. 별도 refresh 호출이 남아있으면
// 백엔드가 refresh token을 1회용으로 회전시킬 때 한쪽이 소진시킨 토큰으로 다른 쪽이 실패해
// 강제 로그아웃/로더 에러로 이어질 수 있다.
export const refreshAccessToken = (): Promise<string> => {
  if (isRefreshing) {
    return new Promise((resolve, reject) => {
      pendingQueue.push({ resolve, reject });
    });
  }

  isRefreshing = true;
  return (async () => {
    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}${AUTH_ENDPOINTS.TOKEN_REFRESH}`,
        null,
        { withCredentials: true },
      );

      const newAccessToken = data.data?.accessToken;
      if (!newAccessToken) throw new Error('Access token not found');

      setAccessToken(newAccessToken);
      processQueue(null, newAccessToken);
      return newAccessToken;
    } catch (error) {
      processQueue(error);
      throw error;
    } finally {
      isRefreshing = false;
    }
  })();
};

const isSessionExpiredRefreshStatus = (status: number | undefined) =>
  status === 400 || status === 401 || status === 403;

instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status;
    const originalRequest = error.config;

    if (!status) return Promise.reject(error);

    if (
      useAuthStore.getState().isLoggingOut ||
      isPathExcluded(originalRequest?.url, REFRESH_RETRY_EXCLUDED_PATHS)
    ) {
      return Promise.reject(error);
    }

    if (status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const newAccessToken = await refreshAccessToken();
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return instance(originalRequest);
      } catch (refreshError) {
        // 400/401/403은 세션 없음·만료로 보고 로그인으로 정리, 5xx는 세션 유지
        const refreshStatus = axios.isAxiosError(refreshError)
          ? refreshError.response?.status
          : undefined;
        if (isSessionExpiredRefreshStatus(refreshStatus)) {
          clearAccessToken();
          await invalidateDeviceToken();

          if (window.location.pathname !== PATHS.LOGIN) {
            if (window.location.pathname !== PATHS.ROOT) {
              saveRedirectAfterLogin(`${window.location.pathname}${window.location.search}`);
            }
            window.location.replace(PATHS.LOGIN);
          }
        }

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);
