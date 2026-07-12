import { useNavigate } from 'react-router';
import { PageShell } from '@/app/layout';
import ShareIcon from '@/shared/assets/Icon/ShareIcon.svg?react';
import { useFeedData } from '@/shared/hooks/feed/useFeedData';
import { useShareFeedCard } from '@/shared/hooks/feed/useShareFeedCard';
import { useEdgeSwipeBack } from '@/shared/hooks/useEdgeSwipeBack';
import { useFirstVisitHint } from '@/shared/hooks/useFirstVisitHint';
import { Header } from '@/shared/ui';
import { FeedActionMenu } from '@/shared/ui/FeedDetail/FeedActionMenu';
import { FeedDetailContent } from '@/shared/ui/FeedDetail/FeedDetailContent';
import { useFeedDetail } from '../hooks/useFeedDetail';

const FEED_DETAIL_HINT_KEY = 'feed-detail-long-press-hint-seen';

export const FeedDetailPage = () => {
  useEdgeSwipeBack();
  const navigate = useNavigate();
  const { teamId, feedIdNum, placeName } = useFeedDetail();
  const { seen, markSeen } = useFirstVisitHint(FEED_DETAIL_HINT_KEY);

  const { authorName, images, content, date, question } = useFeedData(teamId, feedIdNum);
  const shareCardData = images[0]
    ? { imageUrl: images[0].src, authorName, title: question || placeName || content, date }
    : null;
  const { share } = useShareFeedCard(shareCardData);

  return (
    <PageShell
      header={
        <Header
          title={placeName}
          showBackButton
          onBack={() => navigate(-1)}
          rightIcon={shareCardData ? <ShareIcon className="size-6" /> : undefined}
          rightAriaLabel="공유"
          onRightClick={share}
        />
      }
      contentClassName="no-scrollbar flex flex-col gap-[33px] mt-3"
    >
      <FeedDetailContent
        teamId={teamId}
        feedId={feedIdNum}
        showHint={!seen}
        onHintDismiss={markSeen}
        actionSlot={<FeedActionMenu teamId={teamId} feedId={feedIdNum} />}
      />
    </PageShell>
  );
};
