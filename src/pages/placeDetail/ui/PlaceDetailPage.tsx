import { useLocation, useNavigate } from 'react-router';
import { PageShell } from '@/app/layout';
import { useFirstVisitHint } from '@/shared/hooks/useFirstVisitHint';
import { Header, LoadingState } from '@/shared/ui';
import { PlaceDetailFeedItem } from './PlaceDetailFeedItem';
import { usePlaceFeeds } from '../hooks/usePlaceFeeds';

const FEED_DETAIL_HINT_KEY = 'feed-detail-long-press-hint-seen';

interface PlaceFeedsLocationState {
  thumbnailUrl?: string;
}

export const PlaceDetailPage = () => {
  const navigate = useNavigate();
  const { teamId, placeId, feedIds, placeName, isLoading, isError } = usePlaceFeeds();
  const { seen, markSeen } = useFirstVisitHint(FEED_DETAIL_HINT_KEY);
  const pinThumbnail = (useLocation().state as PlaceFeedsLocationState | null)?.thumbnailUrl;

  const content = (() => {
    if (isLoading) return <LoadingState />;
    if (isError) {
      return (
        <p className="body-3 mt-10 text-center text-gray-500">장소 피드를 불러오지 못했습니다.</p>
      );
    }
    return feedIds.map((feedId, index) => (
      <PlaceDetailFeedItem
        key={feedId}
        teamId={teamId}
        feedId={feedId}
        heroKey={index === 0 ? `pin-${placeId}` : undefined}
        placeholderThumbnail={index === 0 ? pinThumbnail : undefined}
        showHint={!seen && index === 0}
        onHintDismiss={markSeen}
      />
    ));
  })();

  return (
    <PageShell
      header={<Header title={placeName} showBackButton onBack={() => navigate(-1)} />}
      contentClassName="no-scrollbar flex flex-col gap-[60px] mt-3"
    >
      {content}
    </PageShell>
  );
};
