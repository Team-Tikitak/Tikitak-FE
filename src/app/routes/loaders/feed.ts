import { redirect, type LoaderFunctionArgs } from 'react-router';
import { queryClient } from '@/app/providers/queryClient';
import { getFeeds } from '@/shared/api/feed/api';
import { feedKeys } from '@/shared/api/feed/keys';
import { feedDetailQueryOptions } from '@/shared/api/feed/queries';
import { unwrap } from '@/shared/api/request';
import { openConfirmDialog } from '@/shared/ui/ConfirmDialog/openConfirmDialog';
import { PATHS } from '../paths';
import {
  ensureActiveTeamId,
  ensureAuthenticatedForLoader,
  getHttpStatus,
  parsePositiveIntegerParam,
} from './shared';

export const feedDetailLoader = async ({ params }: LoaderFunctionArgs) => {
  const feedId = parsePositiveIntegerParam(params.feedId);
  if (!feedId) return redirect(PATHS.FEED);

  await ensureAuthenticatedForLoader();
  const activeTeamId = await ensureActiveTeamId();
  if (!activeTeamId) return redirect(PATHS.HOME);

  try {
    await queryClient.ensureQueryData(feedDetailQueryOptions(activeTeamId, feedId));
  } catch (error) {
    // 삭제된 피드(404)는 안내 다이얼로그를 띄운 뒤 목록으로 돌려보낸다
    if (getHttpStatus(error) === 404) {
      openConfirmDialog({
        title: '오류',
        description: '삭제되었거나 존재하지 않는 게시물이에요',
        confirmLabel: '확인',
        showCancel: false,
      });
    }
    // 세션 레이스 등으로 상세 조회가 실패해도 에러 화면 대신 목록으로 돌려보낸다
    return redirect(PATHS.FEED);
  }
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
