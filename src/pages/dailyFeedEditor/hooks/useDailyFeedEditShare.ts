import { useState } from 'react';
import { useNavigate } from 'react-router';
import { usePatchDailyQuestion } from '@/shared/api/dailyQuestion/queries';
import type { patchDailyQuestionRequest } from '@/shared/api/dailyQuestion/types';
import { uploadMediaBlobs } from '@/shared/api/media/helpers';
import type { CapturedPhoto } from '@/shared/types/photo';

interface UseDailyFeedEditShareParams {
  teamId: number;
  questionId: number | null;
  content: string;
  newPhoto: CapturedPhoto | null;
  existingMediaPublicId?: string | null;
}

export const useDailyFeedEditShare = ({
  teamId,
  questionId,
  content,
  newPhoto,
  existingMediaPublicId,
}: UseDailyFeedEditShareParams) => {
  const navigate = useNavigate();
  const patchDailyQuestionMutation = usePatchDailyQuestion(teamId, questionId ?? 0);
  const [isSharing, setIsSharing] = useState(false);

  const share = async () => {
    if (!teamId || !questionId || isSharing) return;
    setIsSharing(true);
    try {
      const body: patchDailyQuestionRequest = {
        content: { defined: true, value: content },
      };

      if (newPhoto) {
        const [publicId] = await uploadMediaBlobs({
          purpose: 'DAILY_QUESTION_IMAGE',
          teamId,
          blobs: [newPhoto.blob],
          fileNamePrefix: 'daily-question',
        });
        body.mediaPublicId = { defined: true, value: publicId };
      } else if (existingMediaPublicId) {
        body.mediaPublicId = { defined: true, value: existingMediaPublicId };
      }

      await patchDailyQuestionMutation.mutateAsync(body);
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
