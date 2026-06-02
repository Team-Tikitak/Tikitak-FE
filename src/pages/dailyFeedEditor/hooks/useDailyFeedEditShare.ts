import { useNavigate } from 'react-router';
import { usePatchDailyQuestion } from '@/shared/api/dailyQuestion/queries';
import type { PatchDailyQuestionRequest } from '@/shared/api/dailyQuestion/types';
import { deleteMedia } from '@/shared/api/media/api';
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

      let uploadedPublicId: string | undefined;
      if (newPhoto) {
        const [publicId] = await uploadMediaBlobs({
          purpose: 'DAILY_QUESTION_IMAGE',
          teamId,
          blobs: [newPhoto.blob],
          fileNamePrefix: 'daily-question',
        });
        uploadedPublicId = publicId;
        body.mediaPublicId = { defined: true, value: publicId };
      } else if (existingMediaPublicId) {
        body.mediaPublicId = { defined: true, value: existingMediaPublicId };
      }

      try {
        await patchDailyQuestionMutation.mutateAsync(body);
      } catch (error) {
        if (uploadedPublicId) await deleteMedia(uploadedPublicId).catch(() => undefined);
        throw error;
      }
      navigate(-1);
    });
  };

  return { share, isSharing };
};
