import { useParams } from 'react-router';
import { useGetFeedDetail } from '@/shared/api/feed/queries';
import { useMe } from '@/shared/api/user/queries';

export const useFeedDetail = () => {
  const { feedId } = useParams<{ feedId: string }>();
  const { data: me } = useMe();
  const teamId = me?.activeTeamId ?? 0;
  const feedIdNum = Number(feedId);

  const { data } = useGetFeedDetail(teamId, feedIdNum);
  const placeName = data?.place?.name ?? '';
  const isMine = data?.isMine ?? false;

  return { teamId, feedIdNum, placeName, isMine };
};
