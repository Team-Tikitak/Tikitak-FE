export const PATHS = {
  ROOT: '/',
  LOGIN: '/login',
  TERMS: '/terms',
  HOME: '/home',
  FEED: '/feed',
  ACTIVITY: '/activity',
  FEED_CREATE: '/feed/new',
  DAILY_FEED_CREATE: '/feed/new/daily',
  ONBOARDING: '/onboarding',
  MY_PAGE: '/mypage',
  TEAM_DETAIL: '/teams/:teamId',
  TEAM_CREATE: '/teams/new',
  TEAM_PROFILE_SETUP: '/teams/new/profile',
  TEAM_INVITE: '/teams/:teamId/invite',
  INVITE_ACCEPT: '/invite/:token',
  GALLERY: '/gallery',
  PLACE_DETAIL: '/place/:placeId',
  AUTH_CALLBACK: '/oauth/callback',
} as const;

export const toTeamDetail = (teamId: number) => `/teams/${teamId}`;
export const toPlaceDetail = (placeId: string) => `/place/${placeId}`;
export const toTeamInvite = (teamId: number) => `/teams/${teamId}/invite`;
