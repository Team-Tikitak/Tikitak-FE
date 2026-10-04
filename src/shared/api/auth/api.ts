import { Browser } from '@capacitor/browser';
import { Capacitor } from '@capacitor/core';
import { ApiError } from '../error';
import { instance, publicInstance } from '../instance';
import { AUTH_ENDPOINTS } from './endpoints';
import { USER_ENDPOINTS } from '../user/endpoints';
import type { ApiResponse } from '../type';
import type { LoginCodeExchangeRequest, LoginResponse, OAuthProvider } from './types';

const API_REACHABILITY_TIMEOUT_MS = 5000;

// OAuth 시작은 API 도메인으로 화면 전체(웹)/인앱 브라우저(앱)를 이동시켜서, 서버·Cloudflare 터널이 꺼져 있으면
// Cloudflare 오류 페이지가 그대로 노출된다. 이동 전에 API가 살아 있는지 확인한다.
// 살아 있으면 비로그인 401이어도 CORS 헤더가 있는 응답이 와 ApiError가 되지만, 터널 오류(530 등)는 CORS 헤더가 없어 NetworkError가 된다.
export const checkApiReachable = async (): Promise<boolean> => {
  try {
    await publicInstance.get(USER_ENDPOINTS.ME, { timeout: API_REACHABILITY_TIMEOUT_MS });
    return true;
  } catch (error) {
    return error instanceof ApiError && error.status < 500;
  }
};

export const getStartOAuthLogin = (provider: OAuthProvider) => {
  const startUrl = `${import.meta.env.VITE_API_BASE_URL}${AUTH_ENDPOINTS.OAUTH_START(provider)}`;
  // 네이티브: mode=app으로 인앱 브라우저 오픈 → 콜백이 tikitak://oauth/callback 딥링크로 복귀
  if (Capacitor.isNativePlatform()) {
    void Browser.open({ url: `${startUrl}?mode=app` });
    return;
  }
  window.location.href = startUrl;
};

export const postLoginCodeExchange = (body: LoginCodeExchangeRequest) =>
  instance.post<ApiResponse<LoginResponse>>(AUTH_ENDPOINTS.OAUTH_LOGIN_CODE_EXCHANGE, body);

export const postLogout = () => instance.post(AUTH_ENDPOINTS.LOGOUT);
