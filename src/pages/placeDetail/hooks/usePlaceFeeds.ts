import { useParams } from 'react-router';
import { useFeeds } from '@/shared/api/feed/queries';
import { useActiveTeamId } from '@/shared/hooks/useActiveTeamId';

export const usePlaceFeeds = () => {
  const { placeId } = useParams<{ placeId: string }>();
  const teamId = useActiveTeamId();

  const { data, isLoading, isError } = useFeeds(teamId, { placeId });
  const feedIds = (data?.items ?? []).map((f) => f.feedId);
  const placeName = data?.items?.[0]?.place?.name ?? '';

  return { teamId, placeId, feedIds, placeName, isLoading, isError };
};
