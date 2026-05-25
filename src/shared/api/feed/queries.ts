import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getFeedDetail, getFeeds, postFeed } from './api';
import { feedKeys } from './keys';
import type { FeedCreateRequest, FeedListParams } from './types';

export const useCreateFeed = (teamId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: FeedCreateRequest) => postFeed(teamId, body).then((res) => res.data.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: feedKeys.list(teamId) });
    },
  });
};

export const useFeeds = (teamId: number | null | undefined, params: FeedListParams = {}) =>
  useQuery({
    queryKey: feedKeys.listFiltered(teamId ?? 0, params),
    queryFn: () => getFeeds(teamId as number, params).then((res) => res.data.data),
    enabled: typeof teamId === 'number',
    staleTime: 30 * 1000,
  });

export const useGetFeedDetail = (teamId: number, feedId: number) =>
  useQuery({
    queryKey: feedKeys.detail(teamId, feedId),
    queryFn: () => getFeedDetail(teamId, feedId).then((res) => res.data.data),
    enabled: typeof teamId === 'number' && Boolean(feedId),
    staleTime: 30 * 1000,
  });
