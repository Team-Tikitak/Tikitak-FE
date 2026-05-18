import { instance } from '../instance';
import { AUTH_ENDPOINTS } from './endpoints';
import type { ApiResponse } from '../type';
import type { OAuthProvider } from './types';

export const getStartOAuthLogin = (provider: OAuthProvider) => {
  window.location.href = `${import.meta.env.VITE_API_BASE_URL}${AUTH_ENDPOINTS.OAUTH_START(provider)}`;
};

export const postLogout = () => instance.post(AUTH_ENDPOINTS.LOGOUT);

export const postRefreshToken = () =>
  instance.post<ApiResponse<{ accessToken: string }>>(AUTH_ENDPOINTS.TOKEN_REFRESH);
