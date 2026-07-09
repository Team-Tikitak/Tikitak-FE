import { useHomeRegions } from '@/shared/api/home/queries';
import { useActiveTeamId } from '@/shared/hooks/team/useActiveTeamId';
import type { FeedDetailListItem } from '@/shared/ui/FeedDetailList';

export const useRegionFeed = () => {
  const teamId = useActiveTeamId();
  const { data, isPending, isError } = useHomeRegions(teamId > 0 ? teamId : undefined);
  const firstRegion = data?.regions[0];
  const items: FeedDetailListItem[] = firstRegion
    ? [{ feedId: firstRegion.feedId, placeholderThumbnail: firstRegion.thumbnailImageUrl }]
    : [];

  return {
    teamId,
    region: firstRegion?.region ?? '',
    items,
    isLoading: isPending,
    isError,
  };
};
