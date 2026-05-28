import { useLocation } from 'react-router';
import { useFeedData } from '@/shared/hooks/useFeedData';
import { usePinComments } from '@/shared/hooks/usePinComments';
import { openOverlay } from '@/shared/lib';
import { FeedDetail } from './FeedDetail';
import { BottomSheetOverlay, CommentSheet } from '../BottomSheet';
import { ConfirmDialog } from '../ConfirmDialog';
import { LongPressHint } from './LongPressHint';

interface FeedDetailLocationState {
  thumbnailUrl?: string;
}

interface FeedDetailContentProps {
  teamId: number;
  feedId: number;
  heroKey?: string;
  placeholderThumbnail?: string;
  showHint?: boolean;
  onHintDismiss?: () => void;
}

export const FeedDetailContent = ({
  teamId,
  feedId,
  heroKey,
  placeholderThumbnail,
  showHint = false,
  onHintDismiss,
}: FeedDetailContentProps) => {
  const { authorName, participants, images, feedImageIds, content, date } = useFeedData(
    teamId,
    feedId,
  );
  const routeStateThumbnail = (useLocation().state as FeedDetailLocationState | null)?.thumbnailUrl;
  const fallbackThumbnail = placeholderThumbnail ?? routeStateThumbnail;
  const renderedImages =
    images.length > 0 ? images : fallbackThumbnail ? [{ src: fallbackThumbnail }] : [];
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
        heroKey={heroKey ?? `pin-${feedId}`}
        participants={participants}
        images={renderedImages.map((image, imageIndex) => ({
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
            onDeleteRequest={(item) => {
              closeSheet();
              openOverlay(({ isOpen, close, unmount }) =>
                isOpen ? (
                  <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/40">
                    <ConfirmDialog
                      title="댓글을 삭제할까요?"
                      description="삭제한 댓글은 복구할 수 없어요."
                      confirmLabel="삭제하기"
                      destructive
                      onCancel={() => {
                        close();
                        unmount();
                      }}
                      onConfirm={() => {
                        item.onDelete?.();
                        close();
                        unmount();
                        closeSheet();
                      }}
                    />
                  </div>
                ) : null,
              );
            }}
          />
        </BottomSheetOverlay>
      )}
    </>
  );
};
