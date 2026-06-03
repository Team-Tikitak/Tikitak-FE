import { PageShell } from '@/app/layout';
import type { TeamMember } from '@/shared/api/team/types';
import LocationIcon from '@/shared/assets/Icon/LocationIcon.svg?react';
import UserIcon from '@/shared/assets/Icon/UserIcon.svg?react';
import { MAX_PHOTO_FILE_SIZE_BYTES } from '@/shared/constants/feed';
import type { useFeedForm } from '@/shared/hooks/feed/useFeedForm';
import { useImageFileInput } from '@/shared/hooks/useImageFileInput';
import { createPhotoFromFile, normalizeImageUrl, openOverlay } from '@/shared/lib';
import { Button, Chip, FormRowButton, Header, UserChip } from '@/shared/ui';
import { ContentTextarea, PhotoStrip, type PhotoStripItem } from '@/shared/ui/FeedForm';
import { LocationSearchOverlay } from './LocationSearchOverlay';
import { MemberSelectOverlay } from './MemberSelectOverlay';

interface FeedFormViewProps {
  title: string;
  submitLabel: string;
  submitDisabled: boolean;
  onBack: () => void;
  onSubmit: () => void;
  form: ReturnType<typeof useFeedForm>;
  teamMembers: TeamMember[];
  myMemberId?: number | null;
  photoItems: PhotoStripItem[];
  photoCount: number;
}

export const FeedFormView = ({
  title,
  submitLabel,
  submitDisabled,
  onBack,
  onSubmit,
  form,
  teamMembers,
  myMemberId,
  photoItems,
  photoCount,
}: FeedFormViewProps) => {
  const {
    content,
    setContent,
    photos,
    canAddMorePhotos,
    addPhoto,
    maxPhotoCount,
    maxContentLength,
    selectedPlace,
    selectPlace,
    selectedMembers,
    commitMembers,
    removeMember,
  } = form;

  const { openPicker, inputProps } = useImageFileInput({
    multiple: true,
    maxFileSizeBytes: MAX_PHOTO_FILE_SIZE_BYTES,
    onSelect: (files) => {
      const remaining = Math.max(0, maxPhotoCount - photos.length);
      files.slice(0, remaining).forEach((file) => addPhoto(createPhotoFromFile(file)));
    },
  });

  const handleAddPhoto = () => {
    if (!canAddMorePhotos) return;
    openPicker();
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
          const me =
            myMemberId != null ? teamMembers.find((m) => m.teamMemberId === myMemberId) : undefined;
          const withMe =
            me && !picked.some((m) => m.teamMemberId === me.teamMemberId)
              ? [me, ...picked]
              : picked;
          commitMembers(withMe);
          close();
        }}
      />
    ));
  };

  return (
    <PageShell
      header={<Header title={title} onBack={onBack} />}
      contentClassName="flex flex-col overflow-hidden"
      bottomClassName="px-5 pt-3 pb-[calc(24px+env(safe-area-inset-bottom))]"
      bottom={
        <Button
          variant="primary"
          disabled={submitDisabled}
          onClick={onSubmit}
          className="disabled:bg-gray-300 disabled:text-gray-400"
        >
          {submitLabel}
        </Button>
      }
    >
      <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto px-5 pt-6 pb-8">
        <PhotoStrip
          items={photoItems}
          count={photoCount}
          maxPhotoCount={maxPhotoCount}
          canAddMore={canAddMorePhotos}
          onAddPhoto={handleAddPhoto}
        />
        <input {...inputProps} />

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
                    onRemove={
                      member.teamMemberId === myMemberId
                        ? undefined
                        : () => removeMember(member.teamMemberId)
                    }
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
