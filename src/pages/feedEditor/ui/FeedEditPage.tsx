import { useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useGetFeedDetail } from '@/shared/api/feed/queries';
import type { FeedDetailResponse } from '@/shared/api/feed/types';
import { useTeamMembers } from '@/shared/api/team/queries';
import { useGetTeams } from '@/shared/api/user/queries';
import { DEFAULT_MAX_PHOTO_COUNT, useFeedForm } from '@/shared/hooks/feed/useFeedForm';
import { useActiveTeamId } from '@/shared/hooks/team/useActiveTeamId';
import { toSafeImageUrl } from '@/shared/lib';
import { Header, PageState } from '@/shared/ui';
import { confirmDiscardChanges } from '@/shared/ui/ConfirmDialog';
import { FeedFormView } from './FeedFormView';
import { useFeedEditShare } from '../hooks/useFeedEditShare';

interface FeedEditFormProps {
  teamId: number;
  feedId: number;
  feedDetail: FeedDetailResponse;
  myMemberId: number | null;
}

const FeedEditForm = ({ teamId, feedId, feedDetail, myMemberId }: FeedEditFormProps) => {
  const navigate = useNavigate();

  const initialMembers = (feedDetail.taggedMembers ?? []).map((m) => ({
    teamMemberId: m.teamMemberId,
    nickname: m.nickname,
    role: 'MEMBER' as const,
    profileImgUrl: m.profileImageUrl,
  }));

  const [removedImageIds, setRemovedImageIds] = useState<Set<number>>(new Set());
  const keptImages = feedDetail.images.filter((img) => !removedImageIds.has(img.feedImageId));
  const removeExistingImage = (feedImageId: number) =>
    setRemovedImageIds((prev) => new Set([...prev, feedImageId]));

  const form = useFeedForm({
    initialContent: feedDetail.content,
    initialPlace: feedDetail.place ?? null,
    initialMembers,
    maxPhotoCount: DEFAULT_MAX_PHOTO_COUNT - keptImages.length,
  });
  const { content, photos, selectedPlace, selectedMembers, removePhoto } = form;

  const { data: teamMembersData } = useTeamMembers(teamId);
  const teamMembers = teamMembersData?.members ?? [];

  const snapshotRef = useRef({
    content: feedDetail.content ?? '',
    placeId: feedDetail.place?.placeId ?? null,
    memberIds: new Set(feedDetail.taggedMembers.map((m) => m.teamMemberId)),
  });

  const { share, isSharing } = useFeedEditShare({
    teamId,
    feedId,
    content,
    existingImages: keptImages,
    newPhotos: photos,
    selectedPlace,
    selectedMembers,
  });

  const handleBack = () => {
    const snapshot = snapshotRef.current;
    const isDirty =
      content !== snapshot.content ||
      photos.length > 0 ||
      removedImageIds.size > 0 ||
      (selectedPlace?.placeId ?? null) !== snapshot.placeId ||
      selectedMembers.length !== snapshot.memberIds.size ||
      selectedMembers.some((m) => !snapshot.memberIds.has(m.teamMemberId));

    if (!isDirty) {
      navigate(-1);
      return;
    }
    confirmDiscardChanges({ onDiscard: () => navigate(-1) });
  };

  const photoItems = [
    ...keptImages.map((image) => ({
      key: `existing-${image.feedImageId}`,
      src: toSafeImageUrl(image.imageUrl),
      onRemove: () => removeExistingImage(image.feedImageId),
    })),
    ...photos.map((photo) => ({
      key: `new-${photo.id}`,
      src: photo.url,
      onRemove: () => removePhoto(photo.id),
    })),
  ];

  return (
    <FeedFormView
      title="글 수정"
      submitLabel="수정하기"
      submitDisabled={keptImages.length + photos.length === 0 || isSharing}
      onBack={handleBack}
      onSubmit={share}
      form={form}
      teamMembers={teamMembers}
      myMemberId={myMemberId}
      photoItems={photoItems}
      photoCount={keptImages.length + photos.length}
    />
  );
};

export const FeedEditPage = () => {
  const { feedId } = useParams<{ feedId: string }>();
  const navigate = useNavigate();
  const teamId = useActiveTeamId();
  const feedIdNum = Number(feedId);

  const { data: teams } = useGetTeams();
  const myMemberId = teams?.find((team) => team.teamId === teamId)?.teamMemberId ?? null;

  const { data: feedDetail, isLoading, isError } = useGetFeedDetail(teamId, feedIdNum);

  return (
    <PageState
      header={<Header title="글 수정" onBack={() => navigate(-1)} />}
      isLoading={isLoading}
      isError={!isLoading && (isError || !feedDetail)}
      errorMessage="글을 불러오지 못했습니다."
    >
      {feedDetail && (
        <FeedEditForm
          teamId={teamId}
          feedId={feedIdNum}
          feedDetail={feedDetail}
          myMemberId={myMemberId}
        />
      )}
    </PageState>
  );
};
