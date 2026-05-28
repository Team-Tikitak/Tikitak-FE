import { FeedDetailContent } from '@/shared/ui/FeedDetail/FeedDetailContent';

interface PlaceDetailFeedItemProps {
  teamId: number;
  feedId: number;
  heroKey?: string;
  placeholderThumbnail?: string;
  showHint?: boolean;
  onHintDismiss?: () => void;
}

export const PlaceDetailFeedItem = ({
  teamId,
  feedId,
  heroKey,
  placeholderThumbnail,
  showHint,
  onHintDismiss,
}: PlaceDetailFeedItemProps) => (
  <FeedDetailContent
    teamId={teamId}
    feedId={feedId}
    heroKey={heroKey}
    placeholderThumbnail={placeholderThumbnail}
    showHint={showHint}
    onHintDismiss={onHintDismiss}
  />
);
