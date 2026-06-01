import type { FeedListParams } from './types';

export const feedKeys = {
  all: ['feed'] as const,
  list: (teamId: number) => [...feedKeys.all, 'list', teamId] as const,
  listFiltered: (teamId: number, params: FeedListParams) =>
    [...feedKeys.list(teamId), params] as const,
  infiniteListFiltered: (teamId: number, params: FeedListParams) =>
    [...feedKeys.list(teamId), 'infinite', params] as const,
  detail: (teamId: number, feedId: number) => [...feedKeys.all, 'detail', teamId, feedId] as const,
};
