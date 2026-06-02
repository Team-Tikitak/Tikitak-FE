import { useNavigate } from 'react-router';
import { usePatchDailyQuestion } from '@/shared/api/dailyQuestion/queries';
import type { PatchDailyQuestionRequest } from '@/shared/api/dailyQuestion/types';
import { uploadMediaBlobs } from '@/shared/api/media/helpers';
import { useShareSubmit } from '@/shared/hooks/useShareSubmit';
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
  const { submit, isSharing } = useShareSubmit('오늘의 게시물 수정에 실패했어요.');

  const share = () => {
    if (!teamId || !questionId) return;
    return submit(async () => {
      const body: PatchDailyQuestionRequest = {
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
    });
  };

  return { share, isSharing };
};
