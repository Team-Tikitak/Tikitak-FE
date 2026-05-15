export const PATHS = {
  ROOT: '/',
  LOGIN: '/login',
  TERMS: '/terms',
  HOME: '/home',
  FEED: '/feed',
  FEED_CREATE: '/feed/new',
  ONBOARDING: '/onboarding',
  MY_PAGE: '/mypage',
  TEAM_DETAIL: '/teams/:teamId',
  TEAM_CREATE: '/teams/new',
  TEAM_PROFILE_SETUP: '/teams/new/profile',
  TEAM_INVITE: '/teams/:teamId/invite',
  INVITE_ACCEPT: '/invite/:inviteId',
  GALLERY: '/gallery',
} as const;

export const toTeamDetail = (teamId: number) => `/teams/${teamId}`;
