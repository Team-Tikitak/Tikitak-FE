import { useLocation, useNavigate } from 'react-router';
import { PageShell } from '@/app/layout';
import { useFirstVisitHint } from '@/shared/hooks/useFirstVisitHint';
import { useInfiniteScroll } from '@/shared/hooks/useInfiniteScroll';
import { Header, PageState } from '@/shared/ui';
import { PlaceDetailFeedItem } from './PlaceDetailFeedItem';
import { usePlaceFeeds } from '../hooks/usePlaceFeeds';

const FEED_DETAIL_HINT_KEY = 'feed-detail-long-press-hint-seen';

interface PlaceFeedsLocationState {
  thumbnailUrl?: string;
  heroPreviewUrl?: string;
}

export const PlaceDetailPage = () => {
  const navigate = useNavigate();
  const {
    teamId,
    placeId,
    feedIds,
    placeName,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = usePlaceFeeds();
  const { seen, markSeen } = useFirstVisitHint(FEED_DETAIL_HINT_KEY);
  const placeState = useLocation().state as PlaceFeedsLocationState | null;
  const pinPlaceholder = placeState?.heroPreviewUrl ?? placeState?.thumbnailUrl;
  const { observerRef } = useInfiniteScroll({
    hasNextPage: Boolean(hasNextPage) && !isLoading && !isError,
    isFetchingNextPage,
    fetchNextPage,
  });

  const header = <Header title={placeName} showBackButton onBack={() => navigate(-1)} />;

  return (
    <PageState
      header={header}
      isLoading={isLoading}
      isError={isError}
      errorMessage="장소 피드를 불러오지 못했습니다."
    >
      <PageShell header={header} contentClassName="no-scrollbar flex flex-col gap-[60px] mt-3">
        {feedIds.map((feedId, index) => (
          <PlaceDetailFeedItem
            key={feedId}
            teamId={teamId}
            feedId={feedId}
            heroKey={index === 0 ? `pin-${placeId}` : undefined}
            placeholderThumbnail={index === 0 ? pinPlaceholder : undefined}
            showHint={!seen && index === 0}
            onHintDismiss={markSeen}
          />
        ))}
        {feedIds.length > 0 && (
          <div ref={observerRef} className="h-8 shrink-0" aria-hidden="true" />
        )}
      </PageShell>
    </PageState>
  );
};
