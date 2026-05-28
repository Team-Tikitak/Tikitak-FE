import { useParams } from 'react-router';
import { useGetFeedDetail } from '@/shared/api/feed/queries';
import { useActiveTeamId } from '@/shared/hooks/useActiveTeamId';

export const useFeedDetail = () => {
  const { feedId } = useParams<{ feedId: string }>();
  const teamId = useActiveTeamId();
  const feedIdNum = Number(feedId);

  const { data } = useGetFeedDetail(teamId, feedIdNum);
  const placeName = data?.place?.name ?? '';
  const isMine = data?.isMine ?? false;
  const feedType = data?.type ?? null;

  return { teamId, feedIdNum, placeName, isMine, feedType };
};
