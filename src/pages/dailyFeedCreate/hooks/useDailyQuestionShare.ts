import { useState } from 'react';
import { useNavigate } from 'react-router';
import { type CapturedPhoto } from '@/pages/camera/hooks/useCamera';
import { usePostDailyQuestion } from '@/shared/api/dailyQuestion/queries';
import { uploadMediaBlobs } from '@/shared/api/media/helpers';

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
  const [isSharing, setIsSharing] = useState(false);

  const share = async () => {
    if (!teamId || !photo || isSharing) return;
    setIsSharing(true);
    try {
      const [mediaPublicId] = await uploadMediaBlobs({
        purpose: 'DAILY_QUESTION_IMAGE',
        teamId: teamId ?? undefined,
        blobs: [photo.blob],
        fileNamePrefix: 'daily-question',
      });
      await postDailyQuestionMutation.mutateAsync({
        content,
        mediaPublicId,
      });
      navigate(-1);
    } catch (error) {
      console.error('오늘의 게시물 작성 실패', error);
      // TODO: 글로벌 토스트 도입 시 교체
      alert('오늘의 게시물 작성에 실패했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setIsSharing(false);
    }
  };

  return { share, isSharing };
};
