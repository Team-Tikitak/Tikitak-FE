export const PATHS = {
  ROOT: '/',
  LOGIN: '/login',
  TERMS: '/terms',
  HOME: '/home',
  ONBOARDING: '/onboarding',
  MY_PAGE: '/mypage',
  TEAM_DETAIL: '/teams/:teamId',
  TEAM_CREATE: '/teams/new',
  TEAM_PROFILE_SETUP: '/teams/new/profile',
} as const;

export const toTeamDetail = (teamId: number) => `/teams/${teamId}`;
