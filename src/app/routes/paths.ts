import type { LegalDocType } from '@/pages/terms/constants/legalDocuments';

export const PATHS = {
  ROOT: '/',
  LOGIN: '/login',
  TERMS: '/terms',
  TERMS_DETAIL: '/terms/:docType',
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
  FEED_DETAIL: '/feed/:feedId',
  FEED_EDIT: '/feed/:feedId/edit',
  DAILY_FEED_EDIT: '/feed/:feedId/edit/daily',
  PLACE_FEEDS: '/place/:placeId',
  AUTH_CALLBACK: '/oauth/callback',
  NOTIFICATION: '/notification',
} as const;

export const toTermsDetail = (docType: LegalDocType) => `/terms/${docType}`;
export const toTeamDetail = (teamId: number) => `/teams/${teamId}`;
export const toFeedDetail = (feedId: string) => `/feed/${feedId}`;
export const toFeedEdit = (feedId: string | number) => `/feed/${feedId}/edit`;
export const toDailyFeedEdit = (feedId: string | number) => `/feed/${feedId}/edit/daily`;
export const toPlaceFeeds = (placeId: string) => `/place/${placeId}`;
export const toTeamInvite = (teamId: number) => `/teams/${teamId}/invite`;
export const toInviteAccept = (token: string) => `/invite/${token}`;
export const toInviteAppLink = (token: string) => `tikitak://invite/${token}`;
