export const PATHS = {
  ROOT: '/',
  LOGIN: '/login',
  TERMS: '/terms',
  HOME: '/home',
  FEED: '/feed',
  ACTIVITY: '/activity',
  FEED_CREATE: '/feed/new',
  ONBOARDING: '/onboarding',
  MY_PAGE: '/mypage',
  TEAM_DETAIL: '/teams/:teamId',
  TEAM_CREATE: '/teams/new',
  TEAM_PROFILE_SETUP: '/teams/new/profile',
  TEAM_INVITE: '/teams/:teamId/invite',
  INVITE_ACCEPT: '/invite/:token',
  GALLERY: '/gallery',
  FEED_DETAIL: '/feed/:feedId',
  PLACE_FEEDS: '/place/:placeId',
  AUTH_CALLBACK: '/oauth/callback',
} as const;

export const toTeamDetail = (teamId: number) => `/teams/${teamId}`;
export const toFeedDetail = (feedId: string) => `/feed/${feedId}`;
export const toPlaceFeeds = (placeId: string) => `/place/${placeId}`;
export const toTeamInvite = (teamId: number) => `/teams/${teamId}/invite`;
