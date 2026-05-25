import { useFeedData } from '@/shared/hooks/useFeedData';
import { useFirstVisitHint } from '@/shared/hooks/useFirstVisitHint';
import { usePinComments } from '@/shared/hooks/usePinComments';
import { FeedDetail } from './FeedDetail';
import { BottomSheetOverlay, CommentSheet } from '../BottomSheet';
import { LongPressHint } from './LongPressHint';

const FEED_DETAIL_HINT_KEY = 'feed-detail-long-press-hint-seen';

interface FeedDetailContentProps {
  teamId: number;
  feedId: number;
}

export const FeedDetailContent = ({ teamId, feedId }: FeedDetailContentProps) => {
  const { seen, markSeen } = useFirstVisitHint(FEED_DETAIL_HINT_KEY);
  const { authorName, participants, images, feedImageIds, content, date } = useFeedData(
    teamId,
    feedId,
  );
  const {
    openPinKey,
    displayPinKey,
    commentsForOpenPin,
    closeSheet,
    completeClose,
    submitComment,
    addPinAt,
    decoratePins,
  } = usePinComments({ teamId, feedId, feedImageIds });

  return (
    <>
      {!seen && <LongPressHint onDismiss={markSeen} />}
      <FeedDetail
        heroKey={`pin-${feedId}`}
        participants={participants}
        images={images.map((image, imageIndex) => ({
          ...image,
          pins: decoratePins(feedId, imageIndex, image.pins),
        }))}
        authorName={authorName}
        content={content}
        date={date}
        onLongPress={(position, imageIndex) => addPinAt(feedId, imageIndex, position.x, position.y)}
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
    </>
  );
};
