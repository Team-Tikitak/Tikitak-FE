import { useNavigate } from 'react-router';
import { PageShell } from '@/app/layout';
import { toDailyFeedEdit, toFeedEdit } from '@/app/routes/paths';
import { useDeleteFeed } from '@/shared/api/feed/queries';
import MoreIcon from '@/shared/assets/Icon/MoreIcon.svg?react';
import { useFirstVisitHint } from '@/shared/hooks/useFirstVisitHint';
import { openOverlay } from '@/shared/lib';
import { ConfirmDialog, Header } from '@/shared/ui';
import { ActiveMenu } from '@/shared/ui/ActiveMenu/ActiveMenu';
import { FeedDetailContent } from '@/shared/ui/FeedDetail/FeedDetailContent';
import { useFeedDetail } from '../hooks/useFeedDetail';

const FEED_DETAIL_HINT_KEY = 'feed-detail-long-press-hint-seen';

export const FeedDetailPage = () => {
  const navigate = useNavigate();
  const { teamId, feedIdNum, placeName, isMine, feedType } = useFeedDetail();
  const { seen, markSeen } = useFirstVisitHint(FEED_DETAIL_HINT_KEY);

  const { mutate: deleteFeed } = useDeleteFeed(teamId, feedIdNum);

  const handleDeleteClick = () => {
    openOverlay(({ isOpen, close, unmount }) => (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
        style={{ display: isOpen ? undefined : 'none' }}
        onTransitionEnd={unmount}
      >
        <ConfirmDialog
          title="정말 삭제하시나요?"
          description="삭제 시 복구가 불가능해요"
          confirmLabel="삭제하기"
          destructive
          onCancel={close}
          onConfirm={() => {
            deleteFeed();
            close();
          }}
        />
      </div>
    ));
  };

  return (
    <PageShell
      header={
        <Header
          title={placeName}
          showBackButton
          onBack={() => navigate(-1)}
          rightSlot={
            isMine ? (
              <ActiveMenu
                icon={<MoreIcon className="w-5" />}
                onDelete={handleDeleteClick}
                onEdit={() =>
                  navigate(
                    feedType === 'DAILY_QUESTION'
                      ? toDailyFeedEdit(feedIdNum)
                      : toFeedEdit(feedIdNum),
                  )
                }
              />
            ) : undefined
          }
        />
      }
      contentClassName="no-scrollbar flex flex-col gap-[33px] mt-3"
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
