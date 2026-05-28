import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { PageShell } from '@/app/layout';
import { useGetFeedDetail } from '@/shared/api/feed/queries';
import type { FeedDetailResponse } from '@/shared/api/feed/types';
import { MAX_FEED_CONTENT_LENGTH } from '@/shared/constants/feed';
import { useActiveTeamId } from '@/shared/hooks/useActiveTeamId';
import { openOverlay } from '@/shared/lib';
import type { CapturedPhoto } from '@/shared/types/photo';
import { Button, DailyQuestion, Header } from '@/shared/ui';
import { CameraOverlay } from '@/shared/ui/CameraOverlay';
import { ContentTextarea, PhotoSlot, openEditExitConfirm } from '@/shared/ui/FeedForm';
import { useDailyFeedEditShare } from '../hooks/useDailyFeedEditShare';

interface DailyFeedEditFormProps {
  teamId: number;
  feedDetail: FeedDetailResponse;
}

const DailyFeedEditForm = ({ teamId, feedDetail }: DailyFeedEditFormProps) => {
  const navigate = useNavigate();

  const [content, setContentRaw] = useState(feedDetail.content);
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(
    feedDetail.images[0]?.imageUrl ?? null,
  );
  const [newPhoto, setNewPhoto] = useState<CapturedPhoto | null>(null);

  const snapshotRef = useRef({
    content: feedDetail.content,
    imageUrl: feedDetail.images[0]?.imageUrl ?? null,
  });

  const newPhotoRef = useRef(newPhoto);
  useEffect(() => {
    newPhotoRef.current = newPhoto;
  }, [newPhoto]);
  useEffect(() => {
    return () => {
      if (newPhotoRef.current) URL.revokeObjectURL(newPhotoRef.current.url);
    };
  }, []);

  const setContent = (next: string) => setContentRaw(next.slice(0, MAX_FEED_CONTENT_LENGTH));

  const addPhoto = (captured: CapturedPhoto) => {
    setNewPhoto((prev) => {
      if (prev) URL.revokeObjectURL(prev.url);
      return captured;
    });
    setExistingImageUrl(null);
  };

  const removePhoto = () => {
    setNewPhoto((prev) => {
      if (prev) URL.revokeObjectURL(prev.url);
      return null;
    });
    setExistingImageUrl(null);
  };

  const currentPhotoUrl = newPhoto?.url ?? existingImageUrl ?? null;

  const { share, isSharing } = useDailyFeedEditShare({
    teamId,
    questionId: feedDetail.question.questionId,
    content,
    newPhoto,
    existingImageUrl,
  });

  const handleBack = () => {
    const snapshot = snapshotRef.current;
    const isDirty =
      content !== snapshot.content || newPhoto !== null || existingImageUrl !== snapshot.imageUrl;

    if (!isDirty) {
      navigate(-1);
      return;
    }
    openEditExitConfirm({ onExit: () => navigate(-1) });
  };

  const handleAddPhoto = () => {
    openOverlay(({ isOpen, close, unmount }) => (
      <CameraOverlay open={isOpen} onCapture={addPhoto} onClose={close} onExitComplete={unmount} />
    ));
  };

  const shareDisabled = !teamId || !feedDetail.question.questionId || isSharing;

  return (
    <PageShell
      header={<Header title="글 수정" onBack={handleBack} />}
      contentClassName="flex flex-col overflow-hidden"
      bottomClassName="px-5 pt-3 pb-[calc(24px+env(safe-area-inset-bottom))]"
      bottom={
        <Button
          variant="primary"
          disabled={shareDisabled}
          onClick={share}
          className="disabled:bg-gray-300 disabled:text-gray-400"
        >
          {isSharing ? '수정 중...' : '수정하기'}
        </Button>
      }
    >
      <DailyQuestion question={feedDetail.question.content} />

      <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto px-5 pt-6 pb-8">
        <PhotoSlot src={currentPhotoUrl} onAdd={handleAddPhoto} onRemove={removePhoto} />

        <ContentTextarea
          value={content}
          onChange={setContent}
          maxLength={MAX_FEED_CONTENT_LENGTH}
          className="mt-5"
        />
      </div>
    </PageShell>
  );
};

export const DailyFeedEditPage = () => {
  const navigate = useNavigate();
  const { feedId } = useParams<{ feedId: string }>();
  const teamId = useActiveTeamId();
  const feedIdNum = Number(feedId);

  const { data: feedDetail, isLoading, isError } = useGetFeedDetail(teamId, feedIdNum);

  if (isLoading || isError || !feedDetail) {
    return (
      <PageShell header={<Header title="글 수정" onBack={() => navigate(-1)} />}>
        <p className="body-3 mt-10 text-center text-gray-500">
          {isError ? '글을 불러오지 못했습니다.' : '불러오는 중...'}
        </p>
      </PageShell>
    );
  }

  return <DailyFeedEditForm teamId={teamId} feedDetail={feedDetail} />;
};
