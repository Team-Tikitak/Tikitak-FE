import { useParams } from 'react-router';
import { useInfiniteFeeds } from '@/shared/api/feed/queries';
import { useActiveTeamId } from '@/shared/hooks/team/useActiveTeamId';

export const usePlaceFeeds = () => {
  const { placeId } = useParams<{ placeId: string }>();
  const teamId = useActiveTeamId();

  const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteFeeds(teamId, { placeId });
  const feedItems = data?.pages.flatMap((page) => page.items) ?? [];
  const feedIds = feedItems.map((f) => f.feedId);
  const placeName = feedItems[0]?.place?.name ?? '';

  return {
    teamId,
    placeId,
    feedIds,
    placeName,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  };
};
