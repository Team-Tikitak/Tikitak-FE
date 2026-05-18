import { instance } from '../instance';
import type { OAuthProvider } from './types';

export const getStartOAuthLogin = (provider: OAuthProvider) => {
  window.location.href = `${import.meta.env.VITE_API_BASE_URL}/api/v1/auth/oauth/${provider}/start`;
};

export const postLogout = () => {
  return instance.post('/api/v1/auth/logout');
};
