import { useState } from 'react';
import { useNavigate } from 'react-router';
import { usePatchFeed } from '@/shared/api/feed/queries';
import type { FeedImage, FeedPlace } from '@/shared/api/feed/types';
import { uploadMediaBlobs } from '@/shared/api/media/helpers';
import type { TeamMember } from '@/shared/api/team/types';
import type { CapturedPhoto } from '@/shared/types/photo';

interface UseFeedEditShareParams {
  teamId: number;
  feedId: number;
  content: string;
  existingImages: FeedImage[];
  newPhotos: CapturedPhoto[];
  selectedPlace: FeedPlace | null;
  selectedMembers: TeamMember[];
}

export const useFeedEditShare = ({
  teamId,
  feedId,
  content,
  existingImages,
  newPhotos,
  selectedPlace,
  selectedMembers,
}: UseFeedEditShareParams) => {
  const navigate = useNavigate();
  const patchFeedMutation = usePatchFeed(teamId, feedId);
  const [isSharing, setIsSharing] = useState(false);

  const share = async () => {
    if (isSharing) return;
    setIsSharing(true);
    try {
      const newMediaPublicIds =
        newPhotos.length > 0
          ? await uploadMediaBlobs({
              purpose: 'FEED_IMAGE',
              teamId,
              blobs: newPhotos.map((photo) => photo.blob),
              fileNamePrefix: 'feed',
            })
          : [];

      const existingMediaPublicIds = existingImages
        .map((img) => img.mediaPublicId)
        .filter((id): id is string => id !== undefined);

      const mediaPublicIds = [...existingMediaPublicIds, ...newMediaPublicIds];

      await patchFeedMutation.mutateAsync({
        content,
        ...(mediaPublicIds.length > 0 ? { mediaPublicIds } : {}),
        place: selectedPlace,
        taggedTeamMemberIds: selectedMembers.map((member) => member.teamMemberId),
      });
      navigate(-1);
    } catch (error) {
      console.error('피드 수정 실패', error);
      alert('피드 수정에 실패했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setIsSharing(false);
    }
  };

  return { share, isSharing };
};
