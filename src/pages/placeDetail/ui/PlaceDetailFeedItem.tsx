import { FeedDetailContent } from '@/shared/ui/FeedDetail/FeedDetailContent';

interface PlaceDetailFeedItemProps {
  teamId: number;
  feedId: number;
}

export const PlaceDetailFeedItem = ({ teamId, feedId }: PlaceDetailFeedItemProps) => (
  <FeedDetailContent teamId={teamId} feedId={feedId} />
);
