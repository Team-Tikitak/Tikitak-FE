import { useHomeEveryonePick } from '@/shared/api/home/queries';
import { useActiveTeamId } from '@/shared/hooks/team/useActiveTeamId';
import type { FeedDetailListItem } from '@/shared/ui/FeedDetailList';

export const useEveryonePickFeed = () => {
  const teamId = useActiveTeamId();
  const { data, isPending, isError } = useHomeEveryonePick(teamId > 0 ? teamId : undefined);
  const items: FeedDetailListItem[] = (data?.picks ?? []).map((pick) => ({
    feedId: pick.feedId,
    placeholderThumbnail: pick.heroPreviewUrl || pick.thumbnailImageUrl,
  }));

  return { teamId, items, isLoading: isPending, isError };
};
