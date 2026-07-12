import { useQueryClient } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router';
import { PATHS } from '@/app/routes/paths';
import { feedKeys } from '@/shared/api/feed/keys';
import { useGetFeedDetail } from '@/shared/api/feed/queries';
import { useActiveTeamId } from '@/shared/hooks/team/useActiveTeamId';
import { isFeedDeleting } from '@/shared/lib/storage/deleteContextStorage';
import { openConfirmDialog } from '@/shared/ui/ConfirmDialog/openConfirmDialog';

export const useFeedDetail = () => {
  const { feedId } = useParams<{ feedId: string }>();
  const teamId = useActiveTeamId();
  const feedIdNum = Number(feedId);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  // 캐시에 남은 이전 404와 재검증 404로 effect가 두 번 발화해도 안내는 방문당 한 번만
  const notifiedNotFoundRef = useRef(false);

  const { data, error } = useGetFeedDetail(teamId, feedIdNum);

  // 본인 삭제 직후의 404 refetch는 안내 대상이 아니므로 제외한다.
  useEffect(() => {
    const isNotFound = isAxiosError(error) && error.response?.status === 404;
    if (!isNotFound || isFeedDeleting() || notifiedNotFoundRef.current) return;
    notifiedNotFoundRef.current = true;
    openConfirmDialog({
      title: '오류',
      description: '삭제되었거나 존재하지 않는 게시물이에요',
      confirmLabel: '확인',
      showCancel: false,
    });

    // 죽은 캐시를 지워 재진입 시 로더가 새로 조회하도록 한다
    queryClient.removeQueries({ queryKey: feedKeys.detail(teamId, feedIdNum) });
    navigate(PATHS.FEED, { replace: true });
  }, [error, navigate, queryClient, teamId, feedIdNum]);

  const placeName = data?.place?.name ?? '';
  const isMine = data?.isMine ?? false;
  const feedType = data?.type ?? null;

  return { teamId, feedIdNum, placeName, isMine, feedType };
};
