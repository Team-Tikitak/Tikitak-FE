import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getFeeds, postFeed } from './api';
import { feedKeys } from './keys';
import { unwrap } from '../request';
import type { FeedCreateRequest, FeedListParams } from './types';

export const useCreateFeed = (teamId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: FeedCreateRequest) => unwrap(() => postFeed(teamId, body)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: feedKeys.list(teamId) });
    },
  });
};

export const useFeeds = (teamId: number | null | undefined, params: FeedListParams = {}) =>
  useQuery({
    queryKey: feedKeys.listFiltered(teamId ?? 0, params),
    queryFn: () => unwrap(() => getFeeds(teamId as number, params)),
    enabled: typeof teamId === 'number',
    staleTime: 30 * 1000,
  });
