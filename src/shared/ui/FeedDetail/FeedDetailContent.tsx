import { useLocation } from 'react-router';
import { useFeedData } from '@/shared/hooks/useFeedData';
import { usePinComments } from '@/shared/hooks/usePinComments';
import { normalizeImageUrl } from '@/shared/lib';
import { FeedDetail } from './FeedDetail';
import { BottomSheetOverlay, CommentSheet } from '../BottomSheet';
import { LongPressHint } from './LongPressHint';
import type { ReactNode } from 'react';

const COMMENT_SHEET_TITLE = '\uB313\uAE00';
const COMMENT_SHEET_DESCRIPTION = '\uD540 \uC704\uCE58\uC5D0 \uB0A8\uAE34 \uB313\uAE00';

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
  actionSlot?: ReactNode;
}

export const FeedDetailContent = ({
  teamId,
  feedId,
  heroKey,
  placeholderThumbnail,
  showHint = false,
  onHintDismiss,
  actionSlot,
}: FeedDetailContentProps) => {
  const { authorName, participants, images, feedImageIds, content, date } = useFeedData(
    teamId,
    feedId,
  );
  const routeStateThumbnail = (useLocation().state as FeedDetailLocationState | null)?.thumbnailUrl;
  const rawFallbackThumbnail = placeholderThumbnail ?? routeStateThumbnail;
  const fallbackThumbnail = normalizeImageUrl(rawFallbackThumbnail, 'feed-image');
  const isFallback = images.length === 0;
  const renderedImages = !isFallback
    ? images
    : fallbackThumbnail
      ? [{ src: fallbackThumbnail }]
      : [];
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
          pins: isFallback ? [] : decoratePins(feedId, imageIndex, image.pins ?? []),
        }))}
        authorName={authorName}
        content={content}
        date={date}
        actionSlot={actionSlot}
        onLongPress={
          isFallback
            ? undefined
            : (position, imageIndex) => addPinAt(feedId, imageIndex, position.x, position.y)
        }
      />
      {displayPinKey && (
        <BottomSheetOverlay
          open={openPinKey === displayPinKey}
          onClose={closeSheet}
          onExitComplete={completeClose}
          ariaTitle={COMMENT_SHEET_TITLE}
          ariaDescription={COMMENT_SHEET_DESCRIPTION}
        >
          <CommentSheet
            inputVariant="commentup"
            comments={commentsForOpenPin}
            onSubmitComment={submitComment}
            onDeleteRequest={(item) => {
              item.onDelete?.();
              closeSheet();
            }}
          />
        </BottomSheetOverlay>
      )}
    </>
  );
};
