import { useNavigate } from 'react-router';
import { PageShell } from '@/app/layout';
import { useGetDailyQuestion } from '@/shared/api/dailyQuestion/queries';
import UserIcon from '@/shared/assets/Icon/UserIcon.svg?react';
import { useActiveTeamMemberProfile } from '@/shared/hooks/useActiveTeamMemberProfile';
import { normalizeImageUrl, openOverlay } from '@/shared/lib';
import { Button, DailyQuestion, Header, UserChip } from '@/shared/ui';
import { CameraOverlay } from '@/shared/ui/CameraOverlay';
import { ContentTextarea, PhotoSlot } from '@/shared/ui/FeedForm';
import { useDailyQuestionCreateForm } from '../hooks/useDailyQuestionCreateForm';
import { useDailyQuestionShare } from '../hooks/useDailyQuestionShare';

export const DailyFeedCreatePage = () => {
  const navigate = useNavigate();
  const activeTeamMemberProfile = useActiveTeamMemberProfile();
  const { teamId } = activeTeamMemberProfile;
  const { data: dailyQuestion } = useGetDailyQuestion(teamId);

  const { content, setContent, photo, addPhoto, removePhoto, maxContentLength, isShareDisabled } =
    useDailyQuestionCreateForm();

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
        <PhotoSlot src={photo?.url ?? null} onAdd={handleAddPhoto} onRemove={removePhoto} />

        <ContentTextarea
          value={content}
          onChange={setContent}
          maxLength={maxContentLength}
          className="mt-5"
        />

        {activeTeamMemberProfile.nickname && (
          <section className="mt-7 flex flex-col items-start gap-3">
            <div className="flex h-6 w-full items-center">
              <span className="flex items-center gap-2">
                <UserIcon className="size-5 shrink-0 text-black" aria-hidden="true" />
                <span className="text-h3 leading-[1.4] font-semibold tracking-[0.004em] text-black">
                  인원
                </span>
              </span>
            </div>
            <UserChip
              name={activeTeamMemberProfile.nickname}
              avatarSrc={normalizeImageUrl(activeTeamMemberProfile.profileImgUrl)}
              size="sm"
            />
          </section>
        )}
      </div>
    </PageShell>
  );
};
