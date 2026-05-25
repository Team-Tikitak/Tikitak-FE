import { useNavigate } from 'react-router';
import { PageShell } from '@/app/layout';
import { useFirstVisitHint } from '@/shared/hooks/useFirstVisitHint';
import { Header } from '@/shared/ui';
import { FeedDetailContent } from '@/shared/ui/FeedDetail/FeedDetailContent';
import { useFeedDetail } from '../hooks/useFeedDetail';

const FEED_DETAIL_HINT_KEY = 'feed-detail-long-press-hint-seen';

export const FeedDetailPage = () => {
  const navigate = useNavigate();
  const { teamId, feedIdNum, placeName } = useFeedDetail();
  const { seen, markSeen } = useFirstVisitHint(FEED_DETAIL_HINT_KEY);

  return (
    <PageShell
      header={<Header title={placeName} showBackButton onBack={() => navigate(-1)} />}
      contentClassName="page-fade-in no-scrollbar flex flex-col gap-[33px] mt-3"
    >
      <FeedDetailContent
        teamId={teamId}
        feedId={feedIdNum}
        showHint={!seen}
        onHintDismiss={markSeen}
      />
    </PageShell>
  );
};
