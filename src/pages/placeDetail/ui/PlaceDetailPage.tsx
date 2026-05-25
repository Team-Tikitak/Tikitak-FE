import { useNavigate } from 'react-router';
import { PageShell } from '@/app/layout';
import { Header } from '@/shared/ui';
import { PlaceDetailFeedItem } from './PlaceDetailFeedItem';
import { usePlaceFeeds } from '../hooks/usePlaceFeeds';

export const PlaceDetailPage = () => {
  const navigate = useNavigate();
  const { teamId, feedIds, placeName } = usePlaceFeeds();

  return (
    <PageShell
      header={<Header title={placeName} showBackButton onBack={() => navigate(-1)} />}
      contentClassName="page-fade-in no-scrollbar flex flex-col gap-[60px] mt-3"
    >
      {feedIds.map((feedId) => (
        <PlaceDetailFeedItem key={feedId} teamId={teamId} feedId={feedId} />
      ))}
    </PageShell>
  );
};
