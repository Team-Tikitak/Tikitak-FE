import { useNavigate } from 'react-router';
import { PageShell } from '@/app/layout';
import { FeedDetail, Header, type PressPosition } from '@/shared/ui';
import { MOCK_PLACE_FEEDS } from '../model/mock';

export const PlaceDetailPage = () => {
  const navigate = useNavigate();
  const { placeName, feeds } = MOCK_PLACE_FEEDS;

  const handleLongPress = (_position: PressPosition) => {
    // TODO: 댓글 창 열기
  };

  return (
    <PageShell
      header={<Header title={placeName} showBackButton onBack={() => navigate(-1)} />}
      contentClassName="flex flex-col gap-[33px] mt-3"
    >
      {feeds.map((feed) => (
        <FeedDetail
          key={feed.id}
          participants={feed.participants}
          images={feed.images}
          authorName={feed.authorName}
          content={feed.content}
          date={feed.date}
          onLongPress={handleLongPress}
        />
      ))}
    </PageShell>
  );
};
