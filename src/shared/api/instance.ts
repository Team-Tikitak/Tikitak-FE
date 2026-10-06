import axios from 'axios';
import { PATHS } from '@/app/routes/paths';
import { invalidateDeviceToken } from '@/shared/lib/native/getDeviceToken';
import {
  clearStoredRefreshToken,
  readStoredRefreshToken,
  storeRefreshToken,
} from '@/shared/lib/native/refreshTokenStorage';
import { saveRedirectAfterLogin } from '@/shared/lib/routing/redirectAfterLogin';
import { useAuthStore } from '../stores/authStore';
import { AUTH_ENDPOINTS } from './auth/endpoints';
import { ApiError, assertEnvelopeSuccess, toApiError } from './error';
import { clearPersistedQueryCache } from './queryCachePersist';
import type { ApiResponse } from './type';

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
type TokenResponse = { accessToken: string; refreshToken?: string };

// 백엔드가 "refresh 쿠키 없음"일 때 내려주는 코드. 쿠키가 앱 재시작 후 남지 않는 경우에 해당한다.
const REFRESH_COOKIE_MISSING_CODE = 'AUTH006';

const postRefresh = (refreshToken?: string) =>
  instance.post<ApiResponse<TokenResponse>>(
    AUTH_ENDPOINTS.TOKEN_REFRESH,
    refreshToken ? { refreshToken } : undefined,
  );

// 쿠키 갱신이 기본이다. 쿠키가 없을 때(AUTH006)만 네이티브 보안 저장소의 토큰으로 한 번 더 시도한다.
// 서버가 refresh 토큰을 회전시키므로, 성공할 때마다 새 토큰을 저장해 쿠키와 저장소가 같은 토큰을 가리키게 한다.
const requestTokens = async () => {
  try {
    return await postRefresh();
  } catch (error) {
    if (!(error instanceof ApiError && error.code === REFRESH_COOKIE_MISSING_CODE)) throw error;

    const storedRefreshToken = await readStoredRefreshToken();
    if (!storedRefreshToken) throw error;

    try {
      return await postRefresh(storedRefreshToken);
    } catch (fallbackError) {
      // 서버가 무효로 거절한 토큰(400/401/403)만 지운다. 장애·타임아웃·요청 제한(408/429)이면 보존한다.
      if (
        fallbackError instanceof ApiError &&
        isSessionExpiredRefreshStatus(fallbackError.status)
      ) {
        await clearStoredRefreshToken();
      }
      throw fallbackError;
    }
  }
};

export const refreshAccessToken = (): Promise<string> => {
  if (isRefreshing) {
    return new Promise((resolve, reject) => {
      pendingQueue.push({ resolve, reject });
    });
  }

  isRefreshing = true;
  return (async () => {
    try {
      const { data } = await requestTokens();

      const newAccessToken = data.data?.accessToken;
      if (!newAccessToken) throw new Error('Access token not found');

      setAccessToken(newAccessToken);
      if (data.data.refreshToken) await storeRefreshToken(data.data.refreshToken);
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

// 최종 호출자에게 가는 오류는 ApiError/NetworkError로 통일한다. 401 재발급·로그아웃 판단은 원본 axios 오류로 먼저 끝낸다.
const rejectNormalized = (error: unknown) => Promise.reject(toApiError(error));

publicInstance.interceptors.response.use(assertEnvelopeSuccess, rejectNormalized);

instance.interceptors.response.use(assertEnvelopeSuccess, async (error) => {
  const status = error.response?.status;
  const originalRequest = error.config;

  if (!status) return rejectNormalized(error);

  if (
    useAuthStore.getState().isLoggingOut ||
    isPathExcluded(originalRequest?.url, REFRESH_RETRY_EXCLUDED_PATHS)
  ) {
    return rejectNormalized(error);
  }

  if (status === 401 && !originalRequest._retry) {
    originalRequest._retry = true;

    try {
      const newAccessToken = await refreshAccessToken();
      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      return instance(originalRequest);
    } catch (refreshError) {
      // 400/401/403은 세션 없음·만료로 보고 로그인으로 정리, 5xx는 세션 유지
      const refreshStatus = refreshError instanceof ApiError ? refreshError.status : undefined;
      if (isSessionExpiredRefreshStatus(refreshStatus)) {
        clearAccessToken();
        await clearStoredRefreshToken();
        clearPersistedQueryCache();
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

  return rejectNormalized(error);
});
