import { useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { PageShell } from '@/app/layout';
import { useGetFeedDetail } from '@/shared/api/feed/queries';
import type { FeedDetailResponse } from '@/shared/api/feed/types';
import { useTeamMembers } from '@/shared/api/team/queries';
import LocationIcon from '@/shared/assets/Icon/LocationIcon.svg?react';
import UserIcon from '@/shared/assets/Icon/UserIcon.svg?react';
import { useActiveTeamId } from '@/shared/hooks/useActiveTeamId';
import {
  DEFAULT_MAX_PHOTO_COUNT,
  useFeedForm as useFeedCreateForm,
} from '@/shared/hooks/useFeedForm';
import { normalizeImageUrl, openOverlay } from '@/shared/lib';
import { Button, Chip, FormRowButton, Header, UserChip } from '@/shared/ui';
import { CameraOverlay } from '@/shared/ui/CameraOverlay';
import { confirmDiscardChanges } from '@/shared/ui/ConfirmDialog';
import { ContentTextarea, PhotoStrip } from '@/shared/ui/FeedForm';
import { LocationSearchOverlay } from '@/shared/ui/LocationSearchOverlay';
import { MemberSelectOverlay } from '@/shared/ui/MemberSelectOverlay';
import { useFeedEditShare } from '../hooks/useFeedEditShare';

interface FeedEditFormProps {
  teamId: number;
  feedId: number;
  feedDetail: FeedDetailResponse;
}

const FeedEditForm = ({ teamId, feedId, feedDetail }: FeedEditFormProps) => {
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

  const {
    content,
    setContent,
    photos,
    canAddMorePhotos,
    addPhoto,
    removePhoto,
    maxPhotoCount,
    maxContentLength,
    selectedPlace,
    selectPlace,
    selectedMembers,
    commitMembers,
    removeMember,
  } = useFeedCreateForm({
    initialContent: feedDetail.content,
    initialPlace: feedDetail.place ?? null,
    initialMembers,
    maxPhotoCount: DEFAULT_MAX_PHOTO_COUNT - keptImages.length,
  });

  const { data: teamMembersData } = useTeamMembers(teamId);
  const teamMembers = teamMembersData?.members ?? [];

  const snapshotRef = useRef({
    content: feedDetail.content,
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

  const handleAddPhoto = () => {
    if (!canAddMorePhotos) return;
    openOverlay(({ isOpen, close, unmount }) => (
      <CameraOverlay open={isOpen} onCapture={addPhoto} onClose={close} onExitComplete={unmount} />
    ));
  };

  const handleAddLocation = () => {
    openOverlay(({ isOpen, close, unmount }) => (
      <LocationSearchOverlay
        open={isOpen}
        onClose={close}
        onExitComplete={unmount}
        onSelect={(place) => {
          selectPlace(place);
          close();
        }}
      />
    ));
  };

  const handleAddMembers = () => {
    openOverlay(({ isOpen, close, unmount }) => (
      <MemberSelectOverlay
        open={isOpen}
        onClose={close}
        onExitComplete={unmount}
        teamMembers={teamMembers}
        selectedMembers={selectedMembers}
        onConfirm={(picked) => {
          commitMembers(picked);
          close();
        }}
      />
    ));
  };

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

  return (
    <PageShell
      header={<Header title="글 수정" onBack={handleBack} />}
      contentClassName="flex flex-col overflow-hidden"
      bottomClassName="px-5 pt-3 pb-[calc(24px+env(safe-area-inset-bottom))]"
      bottom={
        <Button
          variant="primary"
          disabled={keptImages.length + photos.length === 0 || isSharing}
          onClick={share}
          className="disabled:bg-gray-300 disabled:text-gray-400"
        >
          {isSharing ? '수정 중...' : '수정하기'}
        </Button>
      }
    >
      <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto px-5 pt-6 pb-8">
        <PhotoStrip
          items={[
            ...keptImages.map((image) => ({
              key: `existing-${image.feedImageId}`,
              src: image.imageUrl,
              onRemove: () => removeExistingImage(image.feedImageId),
            })),
            ...photos.map((photo) => ({
              key: `new-${photo.id}`,
              src: photo.url,
              onRemove: () => removePhoto(photo.id),
            })),
          ]}
          count={keptImages.length + photos.length}
          maxPhotoCount={maxPhotoCount}
          canAddMore={canAddMorePhotos}
          onAddPhoto={handleAddPhoto}
        />

        <ContentTextarea
          value={content}
          onChange={setContent}
          maxLength={maxContentLength}
          className="mt-5"
        />

        <ul className="mt-7 flex flex-col gap-7">
          <li className="flex flex-col gap-3">
            <FormRowButton
              icon={<LocationIcon className="size-5 shrink-0 text-black" aria-hidden="true" />}
              label="위치 추가"
              onClick={handleAddLocation}
            />
            {selectedPlace && <Chip>{selectedPlace.name}</Chip>}
          </li>
          <li className="flex flex-col gap-3">
            <FormRowButton
              icon={<UserIcon className="size-5 shrink-0 text-black" aria-hidden="true" />}
              label="인원 추가"
              onClick={handleAddMembers}
            />
            {selectedMembers.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {selectedMembers.map((member) => (
                  <UserChip
                    key={member.teamMemberId}
                    name={member.nickname}
                    avatarSrc={normalizeImageUrl(member.profileImgUrl)}
                    size="sm"
                    onRemove={() => removeMember(member.teamMemberId)}
                  />
                ))}
              </div>
            )}
          </li>
        </ul>
      </div>
    </PageShell>
  );
};

export const FeedEditPage = () => {
  const { feedId } = useParams<{ feedId: string }>();
  const navigate = useNavigate();
  const teamId = useActiveTeamId();
  const feedIdNum = Number(feedId);

  const { data: feedDetail, isLoading, isError } = useGetFeedDetail(teamId, feedIdNum);

  if (isLoading || isError || !feedDetail) {
    return (
      <PageShell header={<Header title="글 수정" onBack={() => navigate(-1)} />}>
        <p className="body-3 mt-10 text-center text-gray-500">
          {isError ? '글을 불러오지 못했습니다.' : '불러오는 중...'}
        </p>
      </PageShell>
    );
  }

  return <FeedEditForm teamId={teamId} feedId={feedIdNum} feedDetail={feedDetail} />;
};
