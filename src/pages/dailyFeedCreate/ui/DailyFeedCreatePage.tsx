import { useCallback } from 'react';
import { useNavigate } from 'react-router';
import { PageShell } from '@/app/layout';
import { CameraOverlay } from '@/pages/camera/ui/CameraOverlay';
import { MemberSelectOverlay } from '@/pages/feedCreate/ui/MemberSelectOverlay';
import { useGetDailyQuestion } from '@/shared/api/dailyQuestion/queries';
import type { TeamMember } from '@/shared/api/team/types';
import { useMe } from '@/shared/api/user/queries';
import CameraIcon from '@/shared/assets/Icon/CameraIcon.svg?react';
import CloseIcon from '@/shared/assets/Icon/CloseIcon2.svg?react';
import UserIcon from '@/shared/assets/Icon/UserIcon.svg?react';
import { normalizeImageUrl, openOverlay } from '@/shared/lib';
import { Button, DailyQuestion, FormRowButton, Header, UserChip } from '@/shared/ui';
import { useDailyQuestionCreateForm } from '../hooks/useDailyQuestionCreateForm';
import { useDailyQuestionShare } from '../hooks/useDailyQuestionShare';
import { useSelfTag } from '../hooks/useSelfTag';

export const DailyFeedCreatePage = () => {
  const navigate = useNavigate();
  const { data: me } = useMe();
  const teamId = me?.activeTeamId ?? 0;
  const { data: dailyQuestion } = useGetDailyQuestion(teamId);

  const { content, setContent, photo, addPhoto, removePhoto, maxContentLength, isShareDisabled } =
    useDailyQuestionCreateForm();

  const commitMembers = useCallback(() => {}, []);

  const { isSelfTagged, setIsSelfTagged, myProfile, myTeamMember } = useSelfTag({
    teamId,
    commitMembers,
  });

  const { share, isSharing } = useDailyQuestionShare({
    teamId,
    questionId: dailyQuestion?.questionId ?? null,
    content,
    photo,
  });

  const handleAddPhoto = () => {
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
        onConfirm={(picked: TeamMember[]) => {
          setIsSelfTagged(picked.length > 0);
          close();
        }}
      />
    ));
  };

  const shareDisabled = isShareDisabled || !teamId || !dailyQuestion?.questionId || isSharing;

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
      <DailyQuestion question={dailyQuestion?.content ?? ''} />

      <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto px-5 pt-6 pb-8">
        <button
          type="button"
          onClick={handleAddPhoto}
          className="press-feedback flex size-[112px] shrink-0 flex-col items-center justify-center gap-0.5 rounded-lg border border-gray-300 text-gray-900"
        >
          {photo ? (
            <div className="relative size-full overflow-hidden rounded-lg">
              <img src={photo.url} alt="" className="no-native-image size-full object-cover" />
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
