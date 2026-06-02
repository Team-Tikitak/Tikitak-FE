import { useNavigate } from 'react-router';
import { useCreateFeed } from '@/shared/api/feed/queries';
import type { FeedPlace } from '@/shared/api/feed/types';
import { uploadMediaBlobs } from '@/shared/api/media/helpers';
import type { TeamMember } from '@/shared/api/team/types';
import { useShareSubmit } from '@/shared/hooks/useShareSubmit';
import type { CapturedPhoto } from '@/shared/types/photo';

interface UseFeedShareParams {
  teamId: number | null;
  content: string;
  photos: CapturedPhoto[];
  selectedPlace: FeedPlace | null;
  selectedMembers: TeamMember[];
}

export const useFeedShare = ({
  teamId,
  content,
  photos,
  selectedPlace,
  selectedMembers,
}: UseFeedShareParams) => {
  const navigate = useNavigate();
  const createFeedMutation = useCreateFeed(teamId ?? 0);
  const { submit, isSharing } = useShareSubmit('피드 작성에 실패했어요.');

  const share = () => {
    if (!teamId || photos.length === 0) return;
    const tid = teamId;
    return submit(async () => {
      const mediaPublicIds = await uploadMediaBlobs({
        purpose: 'FEED_IMAGE',
        teamId: tid,
        blobs: photos.map((photo) => photo.blob),
        fileNamePrefix: 'feed',
      });
      await createFeedMutation.mutateAsync({
        content,
        mediaPublicIds,
        place: selectedPlace,
        taggedTeamMemberIds: selectedMembers.map((member) => member.teamMemberId),
      });
      navigate(-1);
    });
  };

  return { share, isSharing };
};
