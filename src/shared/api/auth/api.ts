import { Browser } from '@capacitor/browser';
import { Capacitor } from '@capacitor/core';
import { instance } from '../instance';
import { AUTH_ENDPOINTS } from './endpoints';
import type { ApiResponse } from '../type';
import type { LoginCodeExchangeRequest, LoginResponse, OAuthProvider } from './types';

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

export const postRefreshToken = () =>
  instance.post<ApiResponse<{ accessToken: string }>>(AUTH_ENDPOINTS.TOKEN_REFRESH);
