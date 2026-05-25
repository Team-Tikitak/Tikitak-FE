import { instance } from '../instance';
import { FEED_COMMENT_ENDPOINTS } from './endpoints';
import type { ApiResponse } from '../type';
import type {
  FeedCommentListResponse,
  FeedCommentListParams,
  FeedComment,
  PatchFeedCommentRequest,
  FeedCommentRequest,
} from './types';

export const getFeedComments = (teamId: number, feedId: number, params?: FeedCommentListParams) =>
  instance.get<ApiResponse<FeedCommentListResponse>>(
    FEED_COMMENT_ENDPOINTS.COMMENTS(teamId, feedId),
    { params },
  );

export const postFeedComment = (teamId: number, feedId: number, body: FeedCommentRequest) =>
  instance.post<ApiResponse<FeedComment>>(FEED_COMMENT_ENDPOINTS.COMMENTS(teamId, feedId), body);

export const deleteFeedComment = (teamId: number, feedId: number, commentId: number) =>
  instance.delete<ApiResponse<string>>(FEED_COMMENT_ENDPOINTS.COMMENT(teamId, feedId, commentId));

export const patchFeedComment = (
  teamId: number,
  feedId: number,
  commentId: number,
  body: PatchFeedCommentRequest,
) =>
  instance.patch<ApiResponse<FeedComment>>(
    FEED_COMMENT_ENDPOINTS.COMMENT(teamId, feedId, commentId),
    body,
  );
