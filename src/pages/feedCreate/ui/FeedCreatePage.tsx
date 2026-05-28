import { useNavigate } from 'react-router';
import { PageShell } from '@/app/layout';
import { useTeamMembers } from '@/shared/api/team/queries';
import { useMe } from '@/shared/api/user/queries';
import LocationIcon from '@/shared/assets/Icon/LocationIcon.svg?react';
import UserIcon from '@/shared/assets/Icon/UserIcon.svg?react';
import { useFeedForm as useFeedCreateForm } from '@/shared/hooks/useFeedForm';
import { normalizeImageUrl, openOverlay } from '@/shared/lib';
import { Button, Chip, FormRowButton, Header, UserChip } from '@/shared/ui';
import { CameraOverlay } from '@/shared/ui/CameraOverlay';
import { ContentTextarea, PhotoStrip } from '@/shared/ui/FeedForm';
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
        <PhotoStrip
          items={photos.map((photo) => ({
            key: photo.id,
            src: photo.url,
            onRemove: () => removePhoto(photo.id),
          }))}
          count={photos.length}
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
