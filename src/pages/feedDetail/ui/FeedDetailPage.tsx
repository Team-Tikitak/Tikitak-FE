import { useNavigate } from 'react-router';
import { PageShell } from '@/app/layout';
import { toDailyFeedEdit, toFeedEdit } from '@/app/routes/paths';
import { useDeleteFeed } from '@/shared/api/feed/queries';
import MoreIcon from '@/shared/assets/Icon/MoreIcon.svg?react';
import ShareIcon from '@/shared/assets/Icon/ShareIcon.svg?react';
import { useFeedData } from '@/shared/hooks/feed/useFeedData';
import { useShareFeedCard } from '@/shared/hooks/feed/useShareFeedCard';
import { useEdgeSwipeBack } from '@/shared/hooks/useEdgeSwipeBack';
import { useFirstVisitHint } from '@/shared/hooks/useFirstVisitHint';
import { Header, openConfirmDialog } from '@/shared/ui';
import { ActiveMenu } from '@/shared/ui/ActiveMenu/ActiveMenu';
import { FeedDetailContent } from '@/shared/ui/FeedDetail/FeedDetailContent';
import { useFeedDetail } from '../hooks/useFeedDetail';

const FEED_DETAIL_HINT_KEY = 'feed-detail-long-press-hint-seen';

export const FeedDetailPage = () => {
  useEdgeSwipeBack();
  const navigate = useNavigate();
  const { teamId, feedIdNum, placeName, isMine, feedType } = useFeedDetail();
  const { seen, markSeen } = useFirstVisitHint(FEED_DETAIL_HINT_KEY);

  const { authorName, images, content, date } = useFeedData(teamId, feedIdNum);
  const shareCardData = images[0]
    ? { imageUrl: images[0].src, authorName, title: placeName || content, date }
    : null;
  const { share } = useShareFeedCard(shareCardData);

  const { mutate: deleteFeed } = useDeleteFeed(teamId, feedIdNum);

  const handleDeleteClick = () => {
    openConfirmDialog({
      title: '정말 삭제하시겠어요?',
      description: '삭제 후 복구가 불가능해요.',
      confirmLabel: '삭제하기',
      destructive: true,
      onConfirm: deleteFeed,
      overlayClassName: 'z-50',
    });
  };

  const handleEditClick = () => {
    navigate(feedType === 'DAILY_QUESTION' ? toDailyFeedEdit(feedIdNum) : toFeedEdit(feedIdNum));
  };

  const handleReportClick = () => {
    openConfirmDialog({
      title: '정말 신고하시나요?',
      description: '신고 접수 후 검토를 거쳐 처리돼요.',
      confirmLabel: '신고하기',
      destructive: true,
      onConfirm: () => {
        // TODO: 신고 API 연동 필요 — 백엔드 엔드포인트 미정
      },
      overlayClassName: 'z-50',
    });
  };

  const canEdit = feedType !== 'DAILY_QUESTION';

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
        actionSlot={
          <ActiveMenu
            icon={<MoreIcon className="size-6 rotate-90 text-[#666]" />}
            onDelete={isMine ? handleDeleteClick : undefined}
            onEdit={isMine && canEdit ? handleEditClick : undefined}
            onReport={isMine ? undefined : handleReportClick}
          />
        }
      />
    </PageShell>
  );
};
