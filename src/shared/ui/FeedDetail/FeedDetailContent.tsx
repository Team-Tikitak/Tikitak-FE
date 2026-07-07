import { useState, type ReactNode } from 'react';
import { useLocation } from 'react-router';
import { useFeedData } from '@/shared/hooks/feed/useFeedData';
import { usePinComments } from '@/shared/hooks/usePinComments';
import { normalizeImageUrl } from '@/shared/lib';
import { FeedDetail } from './FeedDetail';
import {
  BottomSheetOverlay,
  CommentSheet,
  ParticipantsSheet,
  type ParticipantsSheetItem,
} from '../BottomSheet';
import { LongPressHint } from './LongPressHint';

const COMMENT_SHEET_TITLE = '\uB313\uAE00';
const COMMENT_SHEET_DESCRIPTION = '\uD540 \uC704\uCE58\uC5D0 \uB0A8\uAE34 \uB313\uAE00';
const PARTICIPANTS_SHEET_TITLE = '\uCC38\uC5EC\uD55C \uC778\uC6D0';

interface FeedDetailLocationState {
  thumbnailUrl?: string;
  heroPreviewUrl?: string;
  heroKey?: string;
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
  const routeState = useLocation().state as FeedDetailLocationState | null;
  const fallbackHeroPreview = normalizeImageUrl(routeState?.heroPreviewUrl ?? placeholderThumbnail);
  const fallbackThumbnail = normalizeImageUrl(
    routeState?.thumbnailUrl ?? placeholderThumbnail ?? routeState?.heroPreviewUrl,
  );
  const isFallback = images.length === 0;
  const renderedImages = !isFallback
    ? images
    : fallbackHeroPreview
      ? [
          {
            src: fallbackThumbnail ?? fallbackHeroPreview,
            heroPreviewUrl: fallbackHeroPreview,
            previewOnly: true,
          },
        ]
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
  const [participantsSheetState, setParticipantsSheetState] = useState<
    'closed' | 'open' | 'exiting'
  >('closed');
  const participantItems: ParticipantsSheetItem[] = (participants ?? []).map((participant) => ({
    id: String(participant.id),
    name: participant.name,
    avatarSrc: participant.avatarSrc,
    avatarAlt: participant.avatarAlt,
  }));

  return (
    <>
      {showHint && <LongPressHint onDismiss={onHintDismiss ?? (() => {})} />}
      <FeedDetail
        heroKey={heroKey ?? routeState?.heroKey ?? `pin-${feedId}`}
        participants={participants}
        images={renderedImages.map((image, imageIndex) => ({
          ...image,
          pins: isFallback ? [] : decoratePins(feedId, imageIndex, image.pins ?? []),
        }))}
        authorName={authorName}
        content={content}
        date={date}
        actionSlot={actionSlot}
        onMoreParticipantsClick={() => setParticipantsSheetState('open')}
        onLongPress={
          isFallback
            ? undefined
            : (position, imageIndex) => addPinAt(feedId, imageIndex, position.x, position.y)
        }
      />
      {participantsSheetState !== 'closed' && (
        <BottomSheetOverlay
          open={participantsSheetState === 'open'}
          onClose={() => setParticipantsSheetState('exiting')}
          onExitComplete={() => setParticipantsSheetState('closed')}
          ariaTitle={PARTICIPANTS_SHEET_TITLE}
          ariaDescription={PARTICIPANTS_SHEET_TITLE}
        >
          <ParticipantsSheet participants={participantItems} />
        </BottomSheetOverlay>
      )}
      {displayPinKey && (
        <BottomSheetOverlay
          open={openPinKey === displayPinKey}
          onClose={closeSheet}
          onExitComplete={completeClose}
          ariaTitle={COMMENT_SHEET_TITLE}
          ariaDescription={COMMENT_SHEET_DESCRIPTION}
          avoidKeyboard
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
