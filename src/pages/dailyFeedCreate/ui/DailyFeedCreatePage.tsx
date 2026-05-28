import { useNavigate } from 'react-router';
import { PageShell } from '@/app/layout';
import { useGetDailyQuestion } from '@/shared/api/dailyQuestion/queries';
import type { TeamMember } from '@/shared/api/team/types';
import UserIcon from '@/shared/assets/Icon/UserIcon.svg?react';
import { useActiveTeamId } from '@/shared/hooks/useActiveTeamId';
import { normalizeImageUrl, openOverlay } from '@/shared/lib';
import { Button, DailyQuestion, FormRowButton, Header, UserChip } from '@/shared/ui';
import { CameraOverlay } from '@/shared/ui/CameraOverlay';
import { ContentTextarea, PhotoSlot } from '@/shared/ui/FeedForm';
import { MemberSelectOverlay } from '@/shared/ui/MemberSelectOverlay';
import { useDailyQuestionCreateForm } from '../hooks/useDailyQuestionCreateForm';
import { useDailyQuestionShare } from '../hooks/useDailyQuestionShare';
import { useSelfTag } from '../hooks/useSelfTag';

export const DailyFeedCreatePage = () => {
  const navigate = useNavigate();
  const teamId = useActiveTeamId();
  const { data: dailyQuestion } = useGetDailyQuestion(teamId);

  const { content, setContent, photo, addPhoto, removePhoto, maxContentLength, isShareDisabled } =
    useDailyQuestionCreateForm();

  const { isSelfTagged, setIsSelfTagged, myProfile, myTeamMember } = useSelfTag({ teamId });

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
        <PhotoSlot src={photo?.url ?? null} onAdd={handleAddPhoto} onRemove={removePhoto} />

        <ContentTextarea
          value={content}
          onChange={setContent}
          maxLength={maxContentLength}
          className="mt-5"
        />

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
