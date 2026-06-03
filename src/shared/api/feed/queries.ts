import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
  type InfiniteData,
} from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import { markFeedDeleting } from '@/shared/lib/storage/deleteContextStorage';
import { deleteFeed, getFeedDetail, getFeeds, patchFeed, postFeed } from './api';
import { feedKeys } from './keys';
import { mapKeys } from '../map/keys';
import { unwrap } from '../request';
import type { FeedListResponse, FeedRequest, FeedListParams } from './types';

type FeedListCacheData = FeedListResponse | InfiniteData<FeedListResponse>;

const FEED_LIST_STALE_TIME_MS = 15 * 1000;

const removeFeedFromPage = (page: FeedListResponse, feedId: number): FeedListResponse => ({
  ...page,
  items: page.items.filter((item) => item.feedId !== feedId),
  pageInfo: {
    ...page.pageInfo,
    totalCount: Math.max(0, page.pageInfo.totalCount - 1),
  },
});

const pageHasFeed = (page: FeedListResponse, feedId: number): boolean =>
  page.items.some((item) => item.feedId === feedId);

const removeFeedFromListCache = (
  old: FeedListCacheData | undefined,
  feedId: number,
): FeedListCacheData | undefined => {
  if (!old) {
    return old;
  }

  if ('pages' in old) {
    if (!old.pages.some((page) => pageHasFeed(page, feedId))) {
      return old;
    }
    return {
      ...old,
      pages: old.pages.map((page) => removeFeedFromPage(page, feedId)),
    };
  }

  return pageHasFeed(old, feedId) ? removeFeedFromPage(old, feedId) : old;
};

export const useCreateFeed = (teamId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: FeedRequest) => unwrap(() => postFeed(teamId, body)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: feedKeys.list(teamId) });
      queryClient.invalidateQueries({ queryKey: mapKeys.pins(teamId) });
    },
  });
};

export const useFeeds = (teamId: number | null | undefined, params: FeedListParams = {}) =>
  useQuery({
    queryKey: feedKeys.listFiltered(teamId ?? 0, params),
    queryFn: () => unwrap(() => getFeeds(teamId as number, params)),
    enabled: typeof teamId === 'number' && teamId > 0,
    staleTime: FEED_LIST_STALE_TIME_MS,
  });

export const useInfiniteFeeds = (teamId: number | null | undefined, params: FeedListParams = {}) =>
  useInfiniteQuery<
    FeedListResponse,
    Error,
    InfiniteData<FeedListResponse>,
    ReturnType<typeof feedKeys.infiniteListFiltered>,
    string | undefined
  >({
    queryKey: feedKeys.infiniteListFiltered(teamId ?? 0, params),
    queryFn: ({ pageParam }) =>
      unwrap(() => getFeeds(teamId as number, { ...params, cursor: pageParam })),
    initialPageParam: undefined,
    getNextPageParam: (lastPage) =>
      lastPage.pageInfo.hasNext ? (lastPage.pageInfo.nextCursor ?? undefined) : undefined,
    enabled: typeof teamId === 'number' && teamId > 0,
    staleTime: FEED_LIST_STALE_TIME_MS,
  });

export const usePatchFeed = (teamId: number, feedId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: FeedRequest) => unwrap(() => patchFeed(teamId, feedId, body)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: feedKeys.detail(teamId, feedId) });
      queryClient.invalidateQueries({ queryKey: feedKeys.list(teamId) });
      queryClient.invalidateQueries({ queryKey: mapKeys.pins(teamId) });
    },
  });
};

export const useDeleteFeed = (teamId: number, feedId: number) => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    meta: { errorMessage: '삭제에 실패했어요' },
    mutationFn: () => unwrap(() => deleteFeed(teamId, feedId)),
    onMutate: async () => {
      markFeedDeleting();
      await queryClient.cancelQueries({ queryKey: feedKeys.detail(teamId, feedId) });
      await queryClient.cancelQueries({ queryKey: feedKeys.list(teamId) });
      const snapshots = queryClient.getQueriesData<FeedListCacheData>({
        queryKey: feedKeys.list(teamId),
      });
      queryClient.removeQueries({ queryKey: feedKeys.detail(teamId, feedId) });
      queryClient.setQueriesData<FeedListCacheData>({ queryKey: feedKeys.list(teamId) }, (old) =>
        removeFeedFromListCache(old, feedId),
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
      queryClient.invalidateQueries({ queryKey: mapKeys.pins(teamId) });
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
