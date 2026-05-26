import { FeedDetailContent } from '@/shared/ui/FeedDetail/FeedDetailContent';

interface PlaceDetailFeedItemProps {
  teamId: number;
  feedId: number;
  showHint?: boolean;
  onHintDismiss?: () => void;
}

export const PlaceDetailFeedItem = ({
  teamId,
  feedId,
  showHint,
  onHintDismiss,
}: PlaceDetailFeedItemProps) => (
  <FeedDetailContent
    teamId={teamId}
    feedId={feedId}
    showHint={showHint}
    onHintDismiss={onHintDismiss}
  />
);
