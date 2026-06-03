import { useNavigate } from 'react-router';
import { useGetDailyQuestion } from '@/shared/api/dailyQuestion/queries';
import UserIcon from '@/shared/assets/Icon/UserIcon.svg?react';
import { normalizeImageUrl, openOverlay } from '@/shared/lib';
import { UserChip } from '@/shared/ui';
import { CameraOverlay } from '@/shared/ui/CameraOverlay';
import { DailyFeedFormView } from './DailyFeedFormView';
import { useActiveTeamMemberProfile } from '../hooks/useActiveTeamMemberProfile';
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
    <DailyFeedFormView
      questionText={dailyQuestion?.content ?? ''}
      title="글쓰기"
      submitLabel="공유하기"
      submitDisabled={shareDisabled}
      photoUrl={photo?.url ?? null}
      onAddPhoto={handleAddPhoto}
      onRemovePhoto={removePhoto}
      content={content}
      onChangeContent={setContent}
      maxContentLength={maxContentLength}
      onBack={() => navigate(-1)}
      onSubmit={share}
      footer={
        activeTeamMemberProfile.nickname && (
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
        )
      }
    />
  );
};
