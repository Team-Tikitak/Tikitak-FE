export const AUTH_ENDPOINTS = {
  OAUTH_START: (provider: string) => `/api/v1/auth/oauth/${provider}/start`,
  OAUTH_PREFIX: '/api/v1/auth/oauth/',
  TOKEN_REFRESH: '/api/v1/auth/token/refresh',
  LOGOUT: '/api/v1/auth/logout',
} as const;
