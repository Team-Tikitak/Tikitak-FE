import { useLocation, useNavigate } from 'react-router';
import { PageShell } from '@/app/layout';
import { useEdgeSwipeBack } from '@/shared/hooks/useEdgeSwipeBack';
import { Header, PageState } from '@/shared/ui';
import { FeedDetailList } from '@/shared/ui/FeedDetailList';
import { usePlaceFeeds } from '../hooks/usePlaceFeeds';

interface PlaceFeedsLocationState {
  thumbnailUrl?: string;
  heroPreviewUrl?: string;
}

export const PlaceDetailPage = () => {
  useEdgeSwipeBack();
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
  const placeState = useLocation().state as PlaceFeedsLocationState | null;
  const pinPlaceholder = placeState?.heroPreviewUrl ?? placeState?.thumbnailUrl;
  const items = feedIds.map((feedId, index) => ({
    feedId,
    heroKey: index === 0 ? `pin-${placeId}` : undefined,
    placeholderThumbnail: index === 0 ? pinPlaceholder : undefined,
  }));
  const header = <Header title={placeName} showBackButton onBack={() => navigate(-1)} />;

  return (
    <PageState
      header={header}
      isLoading={isLoading}
      isError={isError}
      errorMessage="장소 피드를 불러오지 못했습니다."
    >
      <PageShell header={header} contentClassName="no-scrollbar flex flex-col gap-[60px] mt-3">
        <FeedDetailList
          teamId={teamId}
          items={items}
          hasNextPage={Boolean(hasNextPage) && !isLoading && !isError}
          isFetchingNextPage={isFetchingNextPage}
          fetchNextPage={fetchNextPage}
        />
      </PageShell>
    </PageState>
  );
};
