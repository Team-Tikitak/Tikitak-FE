import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { PageShell } from '@/app/layout';
import { type CapturedPhoto } from '@/pages/camera/hooks/useCamera';
import { CameraOverlay } from '@/pages/camera/ui/CameraOverlay';
import { useGetFeedDetail } from '@/shared/api/feed/queries';
import type { FeedDetailResponse } from '@/shared/api/feed/types';
import { useMe } from '@/shared/api/user/queries';
import CameraIcon from '@/shared/assets/Icon/CameraIcon.svg?react';
import CloseIcon from '@/shared/assets/Icon/CloseIcon2.svg?react';
import { openOverlay } from '@/shared/lib';
import { Button, ConfirmDialog, DailyQuestion, Header } from '@/shared/ui';
import { useDailyFeedEditShare } from '../hooks/useDailyFeedEditShare';

const MAX_CONTENT_LENGTH = 1000;

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

  const setContent = (next: string) => setContentRaw(next.slice(0, MAX_CONTENT_LENGTH));

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
  });

  const handleBack = () => {
    const snapshot = snapshotRef.current;
    const isDirty =
      content !== snapshot.content || newPhoto !== null || existingImageUrl !== snapshot.imageUrl;

    if (!isDirty) {
      navigate(-1);
      return;
    }
    openOverlay(({ isOpen, close, unmount }) => (
      <div
        className="fixed inset-0 z-60 flex items-center justify-center bg-black/40"
        style={{ display: isOpen ? undefined : 'none' }}
        onTransitionEnd={unmount}
      >
        <ConfirmDialog
          title="수정한 내용이 남아있어요."
          description="지금 나가면 수정한 내용이 저장되지 않아요."
          confirmLabel="계속 수정하기"
          onConfirm={close}
          onCancel={() => {
            close();
            navigate(-1);
          }}
        />
      </div>
    ));
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
        <button
          type="button"
          onClick={handleAddPhoto}
          className="press-feedback flex size-[112px] shrink-0 flex-col items-center justify-center gap-0.5 rounded-lg border border-gray-300 text-gray-900"
        >
          {currentPhotoUrl ? (
            <div className="relative size-full overflow-hidden rounded-lg">
              <img
                src={currentPhotoUrl}
                alt=""
                className="no-native-image size-full object-cover"
              />
              <button
                type="button"
                aria-label="사진 제거"
                onClick={(event) => {
                  event.stopPropagation();
                  removePhoto();
                }}
                className="press-feedback absolute top-1 right-1 flex size-6 items-center justify-center rounded-full bg-black/60 text-white"
              >
                <CloseIcon className="size-4" />
              </button>
            </div>
          ) : (
            <>
              <CameraIcon className="size-6" aria-hidden="true" />
              <span className="button-6 text-gray-900">0/1</span>
            </>
          )}
        </button>

        <div className="mt-5 flex h-[174px] flex-col gap-2 rounded-lg border border-gray-300 p-4">
          <textarea
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder="(선택) 글을 작성해주세요."
            maxLength={MAX_CONTENT_LENGTH}
            className="font-pretendard placeholder:font-pretendard min-h-0 flex-1 resize-none text-[14px] leading-[1.4] tracking-[-0.004em] text-gray-900 outline-none placeholder:text-gray-900"
          />
          <p className="body-10 self-end text-gray-500">
            <span>{content.length}</span> / {MAX_CONTENT_LENGTH.toLocaleString()}
          </p>
        </div>
      </div>
    </PageShell>
  );
};

export const DailyFeedEditPage = () => {
  const { feedId } = useParams<{ feedId: string }>();
  const { data: me } = useMe();
  const teamId = me?.activeTeamId ?? 0;
  const feedIdNum = Number(feedId);

  const { data: feedDetail } = useGetFeedDetail(teamId, feedIdNum);

  if (!feedDetail) return null;

  return <DailyFeedEditForm teamId={teamId} feedDetail={feedDetail} />;
};
