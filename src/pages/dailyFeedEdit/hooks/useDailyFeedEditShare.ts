import { useState } from 'react';
import { useNavigate } from 'react-router';
import { type CapturedPhoto } from '@/pages/camera/hooks/useCamera';
import { usePatchDailyQuestion } from '@/shared/api/dailyQuestion/queries';
import { uploadMediaBlobs } from '@/shared/api/media/helpers';

interface UseDailyFeedEditShareParams {
  teamId: number;
  questionId: number | null;
  content: string;
  newPhoto: CapturedPhoto | null;
}

export const useDailyFeedEditShare = ({
  teamId,
  questionId,
  content,
  newPhoto,
}: UseDailyFeedEditShareParams) => {
  const navigate = useNavigate();
  const patchDailyQuestionMutation = usePatchDailyQuestion(teamId, questionId ?? 0);
  const [isSharing, setIsSharing] = useState(false);

  const share = async () => {
    if (!teamId || !questionId || isSharing) return;
    setIsSharing(true);
    try {
      let mediaPublicId: { defined: boolean; value: string };

      if (newPhoto) {
        const [publicId] = await uploadMediaBlobs({
          purpose: 'DAILY_QUESTION_IMAGE',
          teamId,
          blobs: [newPhoto.blob],
          fileNamePrefix: 'daily-question',
        });
        mediaPublicId = { defined: true, value: publicId };
      } else {
        mediaPublicId = { defined: false, value: '' };
      }

      await patchDailyQuestionMutation.mutateAsync({
        content: { defined: true, value: content },
        mediaPublicId,
      });
      navigate(-1);
    } catch (error) {
      console.error('오늘의 게시물 수정 실패', error);
      alert('오늘의 게시물 수정에 실패했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setIsSharing(false);
    }
  };

  return { share, isSharing };
};
