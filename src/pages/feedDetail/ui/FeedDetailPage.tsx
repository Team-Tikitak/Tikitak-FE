import { useNavigate } from 'react-router';
import { PageShell } from '@/app/layout';
import { Header } from '@/shared/ui';
import { FeedDetailContent } from '@/shared/ui/FeedDetail/FeedDetailContent';
import { useFeedDetail } from '../hooks/useFeedDetail';

export const FeedDetailPage = () => {
  const navigate = useNavigate();
  const { teamId, feedIdNum, placeName } = useFeedDetail();

  return (
    <PageShell
      header={<Header title={placeName} showBackButton onBack={() => navigate(-1)} />}
      contentClassName="page-fade-in no-scrollbar flex flex-col gap-[33px] mt-3"
    >
      <FeedDetailContent teamId={teamId} feedId={feedIdNum} />
    </PageShell>
  );
};
