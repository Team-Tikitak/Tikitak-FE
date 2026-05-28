import { useNavigate } from 'react-router';
import { PageShell } from '@/app/layout';
import { CameraOverlay } from '@/pages/camera/ui/CameraOverlay';
import { useTeamMembers } from '@/shared/api/team/queries';
import { useMe } from '@/shared/api/user/queries';
import CameraIcon from '@/shared/assets/Icon/CameraIcon.svg?react';
import CloseIcon from '@/shared/assets/Icon/CloseIcon2.svg?react';
import LocationIcon from '@/shared/assets/Icon/LocationIcon.svg?react';
import UserIcon from '@/shared/assets/Icon/UserIcon.svg?react';
import { useFeedForm as useFeedCreateForm } from '@/shared/hooks/useFeedForm';
import { normalizeImageUrl, openOverlay } from '@/shared/lib';
import { Button, Chip, FormRowButton, Header, UserChip } from '@/shared/ui';
import { LocationSearchOverlay } from '@/shared/ui/LocationSearchOverlay';
import { MemberSelectOverlay } from '@/shared/ui/MemberSelectOverlay';
import { useFeedShare } from '../hooks/useFeedShare';

export const FeedCreatePage = () => {
  const navigate = useNavigate();
  const { data: me } = useMe();
  const teamId = me?.activeTeamId ?? null;
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
    isShareDisabled,
  } = useFeedCreateForm();

  const { data: teamMembersData } = useTeamMembers(teamId);
  const teamMembers = teamMembersData?.members ?? [];

  const { share, isSharing } = useFeedShare({
    teamId,
    content,
    photos,
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

  const shareDisabled = isShareDisabled || !teamId || isSharing;

  return (
    <PageShell
      header={<Header title="글쓰기" onBack={() => navigate(-1)} />}
      contentClassName="flex flex-col overflow-hidden"
      bottomClassName="px-5 pt-3 pb-[calc(24px+env(safe-area-inset-bottom))]"
      bottom={
        <Button
          variant="primary"
          disabled={shareDisabled}
          onClick={share}
          className="disabled:bg-gray-300 disabled:text-gray-400"
        >
          {isSharing ? '공유 중...' : '공유하기'}
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
              {photos.length}/{maxPhotoCount}
            </span>
          </button>
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
              disabled={!teamId}
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
