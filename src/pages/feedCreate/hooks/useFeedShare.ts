import { useState } from 'react';
import { useNavigate } from 'react-router';
import { type CapturedPhoto } from '@/pages/camera/hooks/useCamera';
import { useCreateFeed } from '@/shared/api/feed/queries';
import type { FeedPlace } from '@/shared/api/feed/types';
import { uploadMediaBlobs } from '@/shared/api/media/helpers';
import type { TeamMember } from '@/shared/api/team/types';

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
  const [isSharing, setIsSharing] = useState(false);

  const share = async () => {
    if (!teamId || photos.length === 0 || isSharing) return;
    setIsSharing(true);
    try {
      const mediaPublicIds = await uploadMediaBlobs({
        purpose: 'FEED_IMAGE',
        teamId,
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
    } catch (error) {
      console.error('피드 작성 실패', error);
      // TODO: 글로벌 토스트 도입 시 교체
      alert('피드 작성에 실패했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setIsSharing(false);
    }
  };

  return { share, isSharing };
};
