import { useFeedData } from '@/shared/hooks/useFeedData';
import { usePinComments } from '@/shared/hooks/usePinComments';
import { FeedDetail } from './FeedDetail';
import { BottomSheetOverlay, CommentSheet } from '../BottomSheet';
import { LongPressHint } from './LongPressHint';

interface FeedDetailContentProps {
  teamId: number;
  feedId: number;
  showHint?: boolean;
  onHintDismiss?: () => void;
}

export const FeedDetailContent = ({
  teamId,
  feedId,
  showHint = false,
  onHintDismiss,
}: FeedDetailContentProps) => {
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
      {showHint && <LongPressHint onDismiss={onHintDismiss ?? (() => {})} />}
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
