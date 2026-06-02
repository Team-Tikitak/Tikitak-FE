import { useNavigate } from 'react-router';
import { usePostDailyQuestion } from '@/shared/api/dailyQuestion/queries';
import { uploadMediaBlobs } from '@/shared/api/media/helpers';
import { useShareSubmit } from '@/shared/hooks/useShareSubmit';
import type { CapturedPhoto } from '@/shared/types/photo';

interface UseDailyQuestionShareParams {
  teamId: number | null;
  questionId: number | null;
  content: string;
  photo: CapturedPhoto | null;
}

export const useDailyQuestionShare = ({
  teamId,
  questionId,
  content,
  photo,
}: UseDailyQuestionShareParams) => {
  const navigate = useNavigate();
  const postDailyQuestionMutation = usePostDailyQuestion(teamId ?? 0, questionId ?? 0);
  const { submit, isSharing } = useShareSubmit('오늘의 게시물 작성에 실패했어요.');

  const share = () => {
    if (!teamId || !photo || !questionId) return;
    const tid = teamId;
    const capturedPhoto = photo;
    return submit(async () => {
      const [mediaPublicId] = await uploadMediaBlobs({
        purpose: 'DAILY_QUESTION_IMAGE',
        teamId: tid,
        blobs: [capturedPhoto.blob],
        fileNamePrefix: 'daily-question',
      });
      await postDailyQuestionMutation.mutateAsync({ content, mediaPublicId });
      navigate(-1);
    });
  };

  return { share, isSharing };
};
