import { useNavigate } from 'react-router';
import { PageShell } from '@/app/layout';
import { useFirstVisitHint } from '@/shared/hooks/useFirstVisitHint';
import { FeedDetail, Header } from '@/shared/ui';
import { BottomSheetOverlay, CommentSheet } from '@/shared/ui/BottomSheet';
import { LongPressHint } from './LongPressHint';
import { usePinComments } from '../hooks/usePinComments';
import { MOCK_PLACE_FEEDS } from '../model/mock';

const PLACE_DETAIL_HINT_KEY = 'place-detail-long-press-hint-seen';

export const PlaceDetailPage = () => {
  const navigate = useNavigate();
  const { seen, markSeen } = useFirstVisitHint(PLACE_DETAIL_HINT_KEY);
  // TODO: useParams()의 placeId로 API 조회
  const { placeName, feeds } = MOCK_PLACE_FEEDS;
  const {
    openPinKey,
    displayPinKey,
    commentsForOpenPin,
    closeSheet,
    completeClose,
    submitComment,
    addPinAt,
    decoratePins,
  } = usePinComments(feeds);

  return (
    <PageShell
      header={<Header title={placeName} showBackButton onBack={() => navigate(-1)} />}
      contentClassName="page-fade-in no-scrollbar flex flex-col gap-[33px] mt-3"
    >
      {!seen && <LongPressHint onDismiss={markSeen} />}
      {feeds.map((feed, feedIndex) => (
        <FeedDetail
          key={feed.id}
          heroKey={feedIndex === 0 ? 'pin-1' : undefined}
          participants={feed.participants}
          images={feed.images.map((image, imageIndex) => ({
            ...image,
            pins: decoratePins(feed.id, imageIndex, image.pins),
          }))}
          authorName={feed.authorName}
          content={feed.content}
          date={feed.date}
          onLongPress={(position, imageIndex) =>
            addPinAt(feed.id, imageIndex, position.x, position.y)
          }
        />
      ))}
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
