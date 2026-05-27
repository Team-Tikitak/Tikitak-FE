import { instance } from '../instance';
import { FEED_ENDPOINTS } from './endpoints';
import type { ApiResponse } from '../type';
import type {
  FeedRequest,
  FeedDetailResponse,
  FeedListParams,
  FeedListResponse,
  FeedMutationResponse,
} from './types';

export const postFeed = (teamId: number, body: FeedRequest) =>
  instance.post<ApiResponse<FeedMutationResponse>>(FEED_ENDPOINTS.FEEDS(teamId), body);

export const getFeeds = (teamId: number, params?: FeedListParams) =>
  instance.get<ApiResponse<FeedListResponse>>(FEED_ENDPOINTS.FEEDS(teamId), { params });

export const getFeedDetail = (teamId: number, feedId: number) =>
  instance.get<ApiResponse<FeedDetailResponse>>(FEED_ENDPOINTS.FEED(teamId, feedId));

export const deleteFeed = (teamId: number, feedId: number) =>
  instance.delete<ApiResponse<string>>(FEED_ENDPOINTS.FEED(teamId, feedId));

export const patchFeed = (teamId: number, feedId: number, body: FeedRequest) =>
  instance.patch<ApiResponse<string>>(FEED_ENDPOINTS.FEED(teamId, feedId), body);
