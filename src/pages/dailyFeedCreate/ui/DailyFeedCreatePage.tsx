import { useNavigate } from 'react-router';
import { PageShell } from '@/app/layout';
import { CameraOverlay } from '@/pages/camera/ui/CameraOverlay';
import { useFeedCreateForm } from '@/pages/feedCreate/hooks/useFeedCreateForm';
import { useFeedShare } from '@/pages/feedCreate/hooks/useFeedShare';
import { MemberSelectOverlay } from '@/pages/feedCreate/ui/MemberSelectOverlay';
import { useMe } from '@/shared/api/user/queries';
import CameraIcon from '@/shared/assets/Icon/CameraIcon.svg?react';
import CloseIcon from '@/shared/assets/Icon/CloseIcon2.svg?react';
import UserIcon from '@/shared/assets/Icon/UserIcon.svg?react';
import { normalizeImageUrl, openOverlay } from '@/shared/lib';
import { Button, DailyQuestion, FormRowButton, Header, UserChip } from '@/shared/ui';
import { useSelfTag } from '../hooks/useSelfTag';

const TODAY_QUESTION = '오늘 OOTD에서 가장 마음에 드는 포인트는?';

export const DailyFeedCreatePage = () => {
  const navigate = useNavigate();
  const { data: me } = useMe();
  const teamId = me?.activeTeamId ?? null;

  const {
    content,
    setContent,
    photos,
    canAddMorePhotos,
    addPhoto,
    removePhoto,
    maxPhotoCount,
    maxContentLength,
    commitMembers,
    selectedMembers,
    isShareDisabled,
  } = useFeedCreateForm({ maxPhotoCount: 1 });

  const { isSelfTagged, setIsSelfTagged, myProfile, myTeamMember } = useSelfTag({
    teamId,
    commitMembers,
  });

  const { share, isSharing } = useFeedShare({
    teamId,
    content,
    photos,
    selectedPlace: null,
    selectedMembers,
  });

  const handleAddPhoto = () => {
    if (!canAddMorePhotos) return;
    openOverlay(({ isOpen, close, unmount }) => (
      <CameraOverlay open={isOpen} onCapture={addPhoto} onClose={close} onExitComplete={unmount} />
    ));
  };

  const handleOpenMemberSheet = () => {
    if (!myTeamMember) return;
    openOverlay(({ isOpen, close, unmount }) => (
      <MemberSelectOverlay
        open={isOpen}
        onClose={close}
        onExitComplete={unmount}
        teamMembers={[myTeamMember]}
        selectedMembers={isSelfTagged ? [myTeamMember] : []}
        onConfirm={(picked) => {
          setIsSelfTagged(picked.length > 0);
          close();
        }}
      />
    ));
  };

  const shareDisabled = isShareDisabled || !teamId || isSharing;

  return (
    <PageShell
      header={<Header title="글쓰기" onBack={() => navigate(-1)} />}
      contentClassName="flex flex-col overflow-hidden"
      bottomClassName="px-5 pt-3 pb-[calc(24px+env(safe-area-inset-bottom))]"
      bottom={
        <Button
          variant="primary"
          disabled={shareDisabled}
          onClick={share}
          className="disabled:bg-gray-300 disabled:text-gray-400"
        >
          {isSharing ? '공유 중...' : '공유하기'}
        </Button>
      }
    >
      <DailyQuestion question={TODAY_QUESTION} />

      <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto px-5 pt-6 pb-8">
        <button
          type="button"
          onClick={handleAddPhoto}
          disabled={!canAddMorePhotos && photos.length === 0}
          className="press-feedback flex size-[112px] shrink-0 flex-col items-center justify-center gap-0.5 rounded-lg border border-gray-300 text-gray-900 disabled:opacity-50"
        >
          {photos[0] ? (
            <div className="relative size-full overflow-hidden rounded-lg">
              <img src={photos[0].url} alt="" className="no-native-image size-full object-cover" />
              <button
                type="button"
                aria-label="사진 제거"
                onClick={(event) => {
                  event.stopPropagation();
                  removePhoto(photos[0].id);
                }}
                className="press-feedback absolute top-1 right-1 flex size-6 items-center justify-center rounded-full bg-black/60 text-white"
              >
                <CloseIcon className="size-4" />
              </button>
            </div>
          ) : (
            <>
              <CameraIcon className="size-6" aria-hidden="true" />
              <span className="button-6 text-gray-900">
                {photos.length}/{maxPhotoCount}
              </span>
            </>
          )}
        </button>

        <div className="mt-5 flex h-[174px] flex-col gap-2 rounded-lg border border-gray-300 p-4">
          <textarea
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder="(선택) 글을 작성해주세요."
            maxLength={maxContentLength}
            className="font-pretendard placeholder:font-pretendard min-h-0 flex-1 resize-none text-[14px] leading-[1.4] tracking-[-0.004em] text-gray-900 outline-none placeholder:text-gray-900"
          />
          <p className="body-10 self-end text-gray-500">
            <span>{content.length}</span> / {maxContentLength.toLocaleString()}
          </p>
        </div>

        <div className="mt-7 flex flex-col gap-3">
          <FormRowButton
            icon={<UserIcon className="size-5 shrink-0 text-black" aria-hidden="true" />}
            label="인원 추가"
            onClick={handleOpenMemberSheet}
          />
          {isSelfTagged && (
            <div className="flex flex-wrap gap-2">
              <UserChip
                name={myProfile?.nickname ?? '본인'}
                avatarSrc={normalizeImageUrl(myProfile?.profileImgUrl)}
                size="sm"
                onRemove={() => setIsSelfTagged(false)}
              />
            </div>
          )}
        </div>
      </div>
    </PageShell>
  );
};
