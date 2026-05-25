export const feedCommentKeys = {
  all: ['comment'] as const,
  comments: (teamId: number, feedId: number) =>
    [...feedCommentKeys.all, 'comments', teamId, feedId] as const,
  comment: (teamId: number, feedId: number, commentId: number) =>
    [...feedCommentKeys.all, 'comment', teamId, feedId, commentId] as const,
};
