import { useNavigate, useParams } from 'react-router';
import { useGetFeedDetail } from '@/shared/api/feed/queries';
import type { FeedDetailResponse } from '@/shared/api/feed/types';
import { useActiveTeamId } from '@/shared/hooks/useActiveTeamId';
import { isTodayKstDate, openOverlay } from '@/shared/lib';
import { Header, PageState } from '@/shared/ui';
import { CameraOverlay } from '@/shared/ui/CameraOverlay';
import { DailyFeedFormView } from './DailyFeedFormView';
import { useDailyFeedEditForm } from '../hooks/useDailyFeedEditForm';
import { useDailyFeedEditShare } from '../hooks/useDailyFeedEditShare';

interface DailyFeedEditFormProps {
  teamId: number;
  feedDetail: FeedDetailResponse;
}

const DailyFeedEditForm = ({ teamId, feedDetail }: DailyFeedEditFormProps) => {
  const {
    content,
    setContent,
    newPhoto,
    currentPhotoUrl,
    existingMediaPublicId,
    addPhoto,
    removePhoto,
    handleBack,
    maxContentLength,
  } = useDailyFeedEditForm(feedDetail);

  const { share, isSharing } = useDailyFeedEditShare({
    teamId,
    questionId: feedDetail.question.questionId,
    content,
    newPhoto,
    existingMediaPublicId,
  });

  const handleAddPhoto = () => {
    openOverlay(({ isOpen, close, unmount }) => (
      <CameraOverlay open={isOpen} onCapture={addPhoto} onClose={close} onExitComplete={unmount} />
    ));
  };

  const shareDisabled = !teamId || !feedDetail.question.questionId || !currentPhotoUrl || isSharing;

  return (
    <DailyFeedFormView
      questionText={feedDetail.question.content}
      title="글 수정"
      submitLabel="수정하기"
      submitDisabled={shareDisabled}
      photoUrl={currentPhotoUrl}
      onAddPhoto={handleAddPhoto}
      onRemovePhoto={removePhoto}
      content={content}
      onChangeContent={setContent}
      maxContentLength={maxContentLength}
      onBack={handleBack}
      onSubmit={share}
    />
  );
};

export const DailyFeedEditPage = () => {
  const navigate = useNavigate();
  const { feedId } = useParams<{ feedId: string }>();
  const teamId = useActiveTeamId();
  const feedIdNum = Number(feedId);

  const { data: feedDetail, isLoading, isError } = useGetFeedDetail(teamId, feedIdNum);

  const errorMessage =
    isError || !feedDetail
      ? '글을 불러오지 못했습니다.'
      : !isTodayKstDate(feedDetail.question.answerDate)
        ? '오늘 작성한 답변만 수정할 수 있습니다.'
        : null;

  return (
    <PageState
      header={<Header title="글 수정" onBack={() => navigate(-1)} />}
      isLoading={isLoading}
      isError={errorMessage !== null}
      errorMessage={errorMessage ?? ''}
    >
      {feedDetail && <DailyFeedEditForm teamId={teamId} feedDetail={feedDetail} />}
    </PageState>
  );
};
