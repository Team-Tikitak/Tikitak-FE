import { instance } from '../instance';
import { FEED_ENDPOINTS } from './endpoints';
import type { ApiResponse } from '../type';
import type {
  FeedCreateRequest,
  FeedListParams,
  FeedListResponse,
  FeedMutationResponse,
} from './types';

export const postFeed = (teamId: number, body: FeedCreateRequest) =>
  instance.post<ApiResponse<FeedMutationResponse>>(FEED_ENDPOINTS.FEEDS(teamId), body);

export const getFeeds = (teamId: number, params?: FeedListParams) =>
  instance.get<ApiResponse<FeedListResponse>>(FEED_ENDPOINTS.FEEDS(teamId), { params });
