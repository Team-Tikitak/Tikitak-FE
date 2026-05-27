import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useFeedData } from '@/shared/hooks/useFeedData';
import { usePinComments } from '@/shared/hooks/usePinComments';
import { FeedDetail } from './FeedDetail';
import { BottomSheetOverlay, CommentSheet, type CommentSheetItem } from '../BottomSheet';
import { ConfirmDialog } from '../ConfirmDialog';
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

  const [pendingCommentDelete, setPendingCommentDelete] = useState<CommentSheetItem | null>(null);

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
            onDeleteRequest={(item) => {
              setPendingCommentDelete(item);
            }}
          />
        </BottomSheetOverlay>
      )}
      {pendingCommentDelete &&
        createPortal(
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40">
            <ConfirmDialog
              title="댓글을 삭제할까요?"
              description="삭제한 댓글은 복구할 수 없어요."
              confirmLabel="삭제하기"
              destructive
              onCancel={() => setPendingCommentDelete(null)}
              onConfirm={() => {
                pendingCommentDelete.onDelete?.();
                setPendingCommentDelete(null);
              }}
            />
          </div>,
          document.body,
        )}
    </>
  );
};
