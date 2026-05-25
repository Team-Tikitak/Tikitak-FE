import { useParams } from 'react-router';
import { useFeeds } from '@/shared/api/feed/queries';
import { useMe } from '@/shared/api/user/queries';

export const usePlaceFeeds = () => {
  const { placeId } = useParams<{ placeId: string }>();
  const { data: me } = useMe();
  const teamId = me?.activeTeamId ?? 0;

  const { data, isLoading, isError } = useFeeds(teamId, { placeId });
  const feedIds = (data?.items ?? []).map((f) => f.feedId);
  const placeName = data?.items?.[0]?.place?.name ?? '';

  return { teamId, feedIds, placeName, isLoading, isError };
};
