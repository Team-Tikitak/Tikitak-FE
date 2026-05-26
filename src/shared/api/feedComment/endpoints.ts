export const FEED_COMMENT_ENDPOINTS = {
  COMMENTS: (teamId: number, feedId: number) => `/api/v1/teams/${teamId}/feeds/${feedId}/comments`,
  COMMENT: (teamId: number, feedId: number, commentId: number) =>
    `/api/v1/teams/${teamId}/feeds/${feedId}/comments/${commentId}`,
};
