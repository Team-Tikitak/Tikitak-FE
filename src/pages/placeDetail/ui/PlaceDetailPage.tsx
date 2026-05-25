import { useNavigate } from 'react-router';
import { PageShell } from '@/app/layout';
import { useFirstVisitHint } from '@/shared/hooks/useFirstVisitHint';
import { Header } from '@/shared/ui';
import { PlaceDetailFeedItem } from './PlaceDetailFeedItem';
import { usePlaceFeeds } from '../hooks/usePlaceFeeds';

const FEED_DETAIL_HINT_KEY = 'feed-detail-long-press-hint-seen';

export const PlaceDetailPage = () => {
  const navigate = useNavigate();
  const { teamId, feedIds, placeName } = usePlaceFeeds();
  const { seen, markSeen } = useFirstVisitHint(FEED_DETAIL_HINT_KEY);

  return (
    <PageShell
      header={<Header title={placeName} showBackButton onBack={() => navigate(-1)} />}
      contentClassName="page-fade-in no-scrollbar flex flex-col gap-[60px] mt-3"
    >
      {feedIds.map((feedId, index) => (
        <PlaceDetailFeedItem
          key={feedId}
          teamId={teamId}
          feedId={feedId}
          showHint={!seen && index === 0}
          onHintDismiss={markSeen}
        />
      ))}
    </PageShell>
  );
};
