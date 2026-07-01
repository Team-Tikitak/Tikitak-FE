import { useNavigate } from 'react-router';
import { usePatchFeed } from '@/shared/api/feed/queries';
import type { FeedImage, FeedPlace } from '@/shared/api/feed/types';
import { deleteMedia } from '@/shared/api/media/api';
import { uploadMediaBlobs } from '@/shared/api/media/helpers';
import type { TeamMember } from '@/shared/api/team/types';
import { useShareSubmit } from '@/shared/hooks/useShareSubmit';
import { alertDialog } from '@/shared/lib/native/nativeDialog';
import type { CapturedPhoto } from '@/shared/types/photo';

interface UseFeedEditShareParams {
  teamId: number;
  feedId: number;
  content: string;
  existingImages: FeedImage[];
  newPhotos: CapturedPhoto[];
  selectedPlace: FeedPlace | null;
  selectedMembers: TeamMember[];
  taggableMembers?: TeamMember[];
}

export const useFeedEditShare = ({
  teamId,
  feedId,
  content,
  existingImages,
  newPhotos,
  selectedPlace,
  selectedMembers,
  taggableMembers,
}: UseFeedEditShareParams) => {
  const navigate = useNavigate();
  const patchFeedMutation = usePatchFeed(teamId, feedId);
  const { submit, isSharing } = useShareSubmit('피드 수정에 실패했어요.');

  const share = () =>
    submit(async () => {
      if (taggableMembers) {
        const taggableMemberIds = new Set(taggableMembers.map((member) => member.teamMemberId));
        const hasUntaggableMember = selectedMembers.some(
          (member) => !taggableMemberIds.has(member.teamMemberId),
        );

        if (hasUntaggableMember) {
          await alertDialog('탈퇴한 멤버는 태그할 수 없습니다');
          return;
        }
      }

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

      try {
        await patchFeedMutation.mutateAsync({
          content,
          ...(mediaPublicIds.length > 0 ? { mediaPublicIds } : {}),
          place: selectedPlace,
          taggedTeamMemberIds: selectedMembers.map((member) => member.teamMemberId),
        });
      } catch (error) {
        await Promise.all(newMediaPublicIds.map((id) => deleteMedia(id).catch(() => undefined)));
        throw error;
      }
      navigate(-1);
    });

  return { share, isSharing };
};
