import { useNavigate } from 'react-router';
import { PageShell } from '@/app/layout';
import { useFirstVisitHint } from '@/shared/hooks/useFirstVisitHint';
import { FeedDetail, Header } from '@/shared/ui';
import { BottomSheetOverlay, CommentSheet } from '@/shared/ui/BottomSheet';
import { LongPressHint } from './LongPressHint';
import { useFeedDetail } from '../hooks/useFeedDetail';
import { usePinComments } from '../hooks/usePinComments';

const FEED_DETAIL_HINT_KEY = 'feed-detail-long-press-hint-seen';

export const FeedDetailPage = () => {
  const navigate = useNavigate();
  const { seen, markSeen } = useFirstVisitHint(FEED_DETAIL_HINT_KEY);
  const { teamId, feedIdNum, authorName, participants, images, feedImageIds, placeName, content, date, isLoading: _isLoading, isError: _isError } =
    useFeedDetail();

  const {
    openPinKey,
    displayPinKey,
    commentsForOpenPin,
    closeSheet,
    completeClose,
    submitComment,
    addPinAt,
    decoratePins,
  } = usePinComments({ teamId, feedId: feedIdNum, feedImageIds });

  return (
    <PageShell
      header={<Header title={placeName} showBackButton onBack={() => navigate(-1)} />}
      contentClassName="page-fade-in no-scrollbar flex flex-col gap-[33px] mt-3"
    >
      {!seen && <LongPressHint onDismiss={markSeen} />}
      <FeedDetail
        heroKey="pin-1"
        participants={participants}
        images={images.map((image, imageIndex) => ({
          ...image,
          pins: decoratePins(feedIdNum, imageIndex, image.pins),
        }))}
        authorName={authorName}
        content={content}
        date={date}
        onLongPress={(position, imageIndex) =>
          addPinAt(feedIdNum, imageIndex, position.x, position.y)
        }

      />
      {displayPinKey && (
        <BottomSheetOverlay
          open={openPinKey === displayPinKey}
          onClose={closeSheet}
          onExitComplete={completeClose}
          ariaTitle="댓글"
          ariaDescription="이 위치에 남긴 댓글"
        >
          <CommentSheet
            inputVariant="commentup"
            comments={commentsForOpenPin}
            onSubmitComment={submitComment}
          />
        </BottomSheetOverlay>
      )}
    </PageShell>
  );
};
