import { redirect, type LoaderFunctionArgs } from 'react-router';
import { queryClient } from '@/app/providers/queryClient';
import { getFeeds } from '@/shared/api/feed/api';
import { feedKeys } from '@/shared/api/feed/keys';
import { feedDetailQueryOptions } from '@/shared/api/feed/queries';
import { unwrap } from '@/shared/api/request';
import { PATHS } from '../paths';
import {
  ensureActiveTeamId,
  ensureAuthenticatedForLoader,
  parsePositiveIntegerParam,
} from './shared';

export const feedDetailLoader = async ({ params }: LoaderFunctionArgs) => {
  const feedId = parsePositiveIntegerParam(params.feedId);
  if (!feedId) return redirect(PATHS.FEED);

  await ensureAuthenticatedForLoader();
  const activeTeamId = await ensureActiveTeamId();
  if (!activeTeamId) return redirect(PATHS.HOME);

  await queryClient.ensureQueryData(feedDetailQueryOptions(activeTeamId, feedId));
  return null;
};

export const placeFeedsLoader = async ({ params }: LoaderFunctionArgs) => {
  const placeId = params.placeId;
  if (!placeId) return redirect(PATHS.HOME);

  await ensureAuthenticatedForLoader();
  const activeTeamId = await ensureActiveTeamId();
  if (!activeTeamId) return redirect(PATHS.HOME);

  const feedParams = { placeId };
  try {
    await queryClient.prefetchInfiniteQuery({
      queryKey: feedKeys.infiniteListFiltered(activeTeamId, feedParams),
      queryFn: ({ pageParam }) =>
        unwrap(() => getFeeds(activeTeamId, { ...feedParams, cursor: pageParam })),
      initialPageParam: undefined as string | undefined,
      staleTime: 30 * 1000,
    });
  } catch {
    // 프리페치 실패는 치명적이지 않으므로 무시
  }
  return null;
};
