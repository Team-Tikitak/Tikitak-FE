import type { FeedCommentListParams } from './types';

export const feedCommentKeys = {
  all: ['comment'] as const,
  comments: (teamId: number, feedId: number, params: FeedCommentListParams | null = null) =>
    [...feedCommentKeys.all, 'comments', teamId, feedId, params] as const,
  comment: (teamId: number, feedId: number, commentId: number) =>
    [...feedCommentKeys.all, 'comment', teamId, feedId, commentId] as const,
};
