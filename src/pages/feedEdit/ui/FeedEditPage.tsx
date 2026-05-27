import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { PageShell } from '@/app/layout';
import { CameraOverlay } from '@/pages/camera/ui/CameraOverlay';
import { LocationSearchOverlay } from '@/pages/feedCreate/ui/LocationSearchOverlay';
import { MemberSelectOverlay } from '@/pages/feedCreate/ui/MemberSelectOverlay';
import { useGetFeedDetail } from '@/shared/api/feed/queries';
import { useTeamMembers } from '@/shared/api/team/queries';
import { useMe } from '@/shared/api/user/queries';
import CameraIcon from '@/shared/assets/Icon/CameraIcon.svg?react';
import CloseIcon from '@/shared/assets/Icon/CloseIcon2.svg?react';
import LocationIcon from '@/shared/assets/Icon/LocationIcon.svg?react';
import UserIcon from '@/shared/assets/Icon/UserIcon.svg?react';
import { useFeedForm as useFeedCreateForm } from '@/shared/hooks/useFeedForm';
import { openOverlay } from '@/shared/lib';
import { Button, Chip, ConfirmDialog, FormRowButton, Header, UserChip } from '@/shared/ui';
import { useFeedEditShare } from '../hooks/useFeedEditShare';

export const FeedEditPage = () => {
  const navigate = useNavigate();
  const { feedId } = useParams<{ feedId: string }>();
  const { data: me } = useMe();
  const teamId = me?.activeTeamId ?? 0;
  const feedIdNum = Number(feedId);

  const { data: feedDetail } = useGetFeedDetail(teamId, feedIdNum);

  const initialMembers = useMemo(
    () =>
      (feedDetail?.taggedMembers ?? []).map((m) => ({
        teamMemberId: m.teamMemberId,
        nickname: m.nickname,
        role: 'MEMBER' as const,
        profileImgUrl: m.profileImageUrl,
      })),
    [feedDetail],
  );

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
    initialContent: feedDetail?.content ?? '',
    initialPlace: feedDetail?.place ?? null,
    initialMembers,
  });

  const { data: teamMembersData } = useTeamMembers(teamId);
  const teamMembers = teamMembersData?.members ?? [];

  const [removedImageIds, setRemovedImageIds] = useState<Set<number>>(new Set());
  const keptImages = (feedDetail?.images ?? []).filter(
    (img) => !removedImageIds.has(img.feedImageId),
  );
  const removeExistingImage = (feedImageId: number) =>
    setRemovedImageIds((prev) => new Set([...prev, feedImageId]));

  const snapshotRef = useRef<{
    content: string;
    placeId: string | null;
    memberIds: Set<number>;
  } | null>(null);
  useEffect(() => {
    if (feedDetail && !snapshotRef.current) {
      snapshotRef.current = {
        content: feedDetail.content,
        placeId: feedDetail.place?.placeId ?? null,
        memberIds: new Set(feedDetail.taggedMembers.map((m) => m.teamMemberId)),
      };
    }
  }, [feedDetail]);
  const { share, isSharing } = useFeedEditShare({
    teamId,
    feedId: feedIdNum,
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
      snapshot !== null &&
      (content !== snapshot.content ||
        photos.length > 0 ||
        removedImageIds.size > 0 ||
        (selectedPlace?.placeId ?? null) !== snapshot.placeId ||
        selectedMembers.length !== snapshot.memberIds.size ||
        selectedMembers.some((m) => !snapshot.memberIds.has(m.teamMemberId)));

    if (!isDirty) {
      navigate(-1);
      return;
    }
    openOverlay(({ isOpen, close, unmount }) => (
      <div
        className="fixed inset-0 z-60 flex items-center justify-center bg-black/40"
        style={{ display: isOpen ? undefined : 'none' }}
        onTransitionEnd={unmount}
      >
        <ConfirmDialog
          title="수정한 내용이 남아있어요."
          description="지금 나가면 수정한 내용이 저장되지 않아요."
          confirmLabel="계속 수정하기"
          onConfirm={close}
          onCancel={() => {
            close();
            navigate(-1);
          }}
        />
      </div>
    ));
  };

  return (
    <PageShell
      header={<Header title="글 수정" onBack={handleBack} />}
      contentClassName="flex flex-col overflow-hidden"
      bottomClassName="px-5 pt-3 pb-[calc(24px+env(safe-area-inset-bottom))]"
      bottom={
        <Button
          variant="primary"
          disabled={isSharing}
          onClick={share}
          className="disabled:bg-gray-300 disabled:text-gray-400"
        >
          {isSharing ? '수정 중...' : '수정하기'}
        </Button>
      }
    >
      <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto px-5 pt-6 pb-8">
        <div className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5">
          <button
            type="button"
            onClick={handleAddPhoto}
            disabled={!canAddMorePhotos}
            className="press-feedback flex size-[112px] shrink-0 flex-col items-center justify-center gap-0.5 rounded-lg border border-gray-300 text-gray-900 disabled:opacity-50"
          >
            <CameraIcon className="size-6" aria-hidden="true" />
            <span className="button-6 text-gray-900">
              {keptImages.length + photos.length}/{maxPhotoCount}
            </span>
          </button>

          {keptImages.map((image) => (
            <div
              key={image.feedImageId}
              className="relative size-[112px] shrink-0 overflow-hidden rounded-lg"
            >
              <img src={image.imageUrl} alt="" className="no-native-image size-full object-cover" />
              <button
                type="button"
                aria-label="사진 제거"
                onClick={() => removeExistingImage(image.feedImageId)}
                className="press-feedback absolute top-1 right-1 flex size-6 items-center justify-center rounded-full bg-black/60 text-white"
              >
                <CloseIcon className="size-4" />
              </button>
            </div>
          ))}

          {photos.map((photo) => (
            <div
              key={photo.id}
              className="relative size-[112px] shrink-0 overflow-hidden rounded-lg"
            >
              <img src={photo.url} alt="" className="no-native-image size-full object-cover" />
              <button
                type="button"
                aria-label="사진 제거"
                onClick={() => removePhoto(photo.id)}
                className="press-feedback absolute top-1 right-1 flex size-6 items-center justify-center rounded-full bg-black/60 text-white"
              >
                <CloseIcon className="size-4" />
              </button>
            </div>
          ))}
        </div>

        <div className="mt-5 flex h-[174px] flex-col gap-2 rounded-lg border border-gray-300 p-4">
          <textarea
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder="(선택) 글을 작성해주세요."
            maxLength={maxContentLength}
            className="font-pretendard placeholder:font-pretendard min-h-0 flex-1 resize-none text-[14px] leading-[1.4] tracking-[-0.004em] text-gray-900 outline-none placeholder:text-gray-900"
          />
          <p className="body-10 self-end text-gray-500">
            <span>{content.length}</span> / {maxContentLength.toLocaleString()}
          </p>
        </div>

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
                    avatarSrc={member.profileImgUrl || undefined}
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
