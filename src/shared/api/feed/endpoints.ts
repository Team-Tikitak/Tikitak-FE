export const FEED_ENDPOINTS = {
  FEEDS: (teamId: number) => `/api/v1/teams/${teamId}/feeds`,
  FEED: (teamId: number, feedId: number) => `/api/v1/teams/${teamId}/feeds/${feedId}`,
} as const;
