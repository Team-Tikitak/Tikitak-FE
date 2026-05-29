import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import { markFeedDeleting } from '@/shared/lib/deleteContextStorage';
import { deleteFeed, getFeedDetail, getFeeds, patchFeed, postFeed } from './api';
import { feedKeys } from './keys';
import { unwrap } from '../request';
import type { FeedListResponse, FeedRequest, FeedListParams } from './types';

export const useCreateFeed = (teamId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: FeedRequest) => unwrap(() => postFeed(teamId, body)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: feedKeys.list(teamId) });
    },
  });
};

export const useFeeds = (teamId: number | null | undefined, params: FeedListParams = {}) =>
  useQuery({
    queryKey: feedKeys.listFiltered(teamId ?? 0, params),
    queryFn: () => unwrap(() => getFeeds(teamId as number, params)),
    enabled: typeof teamId === 'number' && teamId > 0,
    staleTime: 30 * 1000,
  });

export const usePatchFeed = (teamId: number, feedId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: FeedRequest) => unwrap(() => patchFeed(teamId, feedId, body)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: feedKeys.detail(teamId, feedId) });
      queryClient.invalidateQueries({ queryKey: feedKeys.list(teamId) });
    },
  });
};

export const useDeleteFeed = (teamId: number, feedId: number) => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: () => unwrap(() => deleteFeed(teamId, feedId)),
    onMutate: async () => {
      markFeedDeleting();
      await queryClient.cancelQueries({ queryKey: feedKeys.detail(teamId, feedId) });
      await queryClient.cancelQueries({ queryKey: feedKeys.list(teamId) });
      const snapshots = queryClient.getQueriesData<FeedListResponse>({
        queryKey: feedKeys.list(teamId),
      });
      queryClient.removeQueries({ queryKey: feedKeys.detail(teamId, feedId) });
      queryClient.setQueriesData<FeedListResponse>(
        { queryKey: feedKeys.list(teamId) },
        (old) => old && { ...old, items: old.items.filter((item) => item.feedId !== feedId) },
      );
      return { snapshots };
    },
    onError: (_err, _vars, context) => {
      context?.snapshots.forEach(([key, data]) => {
        if (data) queryClient.setQueryData(key, data);
      });
    },
    onSettled: () => {
      queryClient.removeQueries({ queryKey: feedKeys.detail(teamId, feedId) });
      queryClient.invalidateQueries({ queryKey: feedKeys.list(teamId) });
    },
    onSuccess: () => {
      navigate(-1);
    },
  });
};

export const useGetFeedDetail = (teamId: number, feedId: number) =>
  useQuery({
    queryKey: feedKeys.detail(teamId, feedId),
    queryFn: () => getFeedDetail(teamId, feedId).then((res) => res.data.data),
    enabled: teamId > 0 && Boolean(feedId),
    staleTime: 30 * 1000,
  });
