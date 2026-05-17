import { type ReactNode } from 'react';
import { useNavigate } from 'react-router';
import { PageShell } from '@/app/layout';
import { CameraOverlay } from '@/pages/camera/ui/CameraOverlay';
import CameraIcon from '@/shared/assets/Icon/CameraIcon.svg?react';
import CloseIcon from '@/shared/assets/Icon/CloseIcon2.svg?react';
import LocationIcon from '@/shared/assets/Icon/LocationIcon.svg?react';
import RightIcon from '@/shared/assets/Icon/RightIcon.svg?react';
import UserIcon from '@/shared/assets/Icon/UserIcon.svg?react';
import { openOverlay } from '@/shared/lib';
import { Button, Chip, Header, UserChip } from '@/shared/ui';
import {
  BottomSheetOverlay,
  LocationSearchSheet,
  MemberSelectSheet,
} from '@/shared/ui/BottomSheet';
import { useFeedCreateForm } from '../hooks/useFeedCreateForm';
import { MOCK_LOCATIONS, MOCK_MEMBERS } from '../model/mock';

interface FormRowButtonProps {
  icon: ReactNode;
  label: string;
  onClick: () => void;
}

const TODAY_QUESTION = '오늘 OOTD에서 가장 마음에 드는 포인트는?';

const FormRowButton = ({ icon, label, onClick }: FormRowButtonProps) => (
  <button
    type="button"
    onClick={onClick}
    className="press-feedback flex h-6 w-full items-center justify-between"
  >
    <span className="flex items-center gap-2">
      {icon}
      <span className="text-h3 leading-[1.4] font-semibold tracking-[0.004em] text-black">
        {label}
      </span>
    </span>
    <RightIcon className="size-6 shrink-0" aria-hidden="true" />
  </button>
);

export const FeedCreatePage = () => {
  const navigate = useNavigate();
  const {
    content,
    setContent,
    photos,
    canAddMorePhotos,
    addPhoto,
    removePhoto,
    maxPhotoCount,
    maxContentLength,
    selectedLocationTitle,
    selectedMemberIds,
    selectedMembers,
    selectLocation,
    commitMembers,
    removeMember,
    handleShare,
    isShareDisabled,
  } = useFeedCreateForm();

  const handleAddPhoto = () => {
    if (!canAddMorePhotos) return;
    openOverlay(({ isOpen, close, unmount }) => (
      <CameraOverlay open={isOpen} onCapture={addPhoto} onClose={close} onExitComplete={unmount} />
    ));
  };

  const handleAddLocation = () => {
    openOverlay(({ isOpen, close, unmount }) => (
      <BottomSheetOverlay
        open={isOpen}
        onClose={close}
        onExitComplete={unmount}
        ariaTitle="장소 검색"
        ariaDescription="장소를 검색해 추가하세요"
      >
        <LocationSearchSheet
          locations={MOCK_LOCATIONS}
          onSelect={(locationId) => {
            selectLocation(locationId);
            close();
          }}
        />
      </BottomSheetOverlay>
    ));
  };

  const handleAddMembers = () => {
    openOverlay(({ isOpen, close, unmount }) => (
      <BottomSheetOverlay
        open={isOpen}
        onClose={close}
        onExitComplete={unmount}
        ariaTitle="인원 추가"
        ariaDescription="이번 게시물에 함께한 인원을 선택하세요"
      >
        <MemberSelectSheet
          members={MOCK_MEMBERS}
          initialSelectedIds={selectedMemberIds}
          onConfirm={(memberIds) => {
            commitMembers(memberIds);
            close();
          }}
        />
      </BottomSheetOverlay>
    ));
  };

  return (
    <PageShell
      header={<Header title="글쓰기" onBack={() => navigate(-1)} />}
      contentClassName="flex flex-col overflow-hidden"
      bottomClassName="px-5 pt-3 pb-[calc(24px+env(safe-area-inset-bottom))]"
      bottom={
        <Button
          variant="primary"
          disabled={isShareDisabled}
          onClick={handleShare}
          className="disabled:bg-gray-300 disabled:text-gray-400"
        >
          공유하기
        </Button>
      }
    >
      <section className="flex h-9 shrink-0 items-center justify-center gap-[10px] bg-[#43b0e0] px-5 text-white">
        <span className="logo shrink-0 text-white">Today’s Tiki-tak!</span>
        <span className="min-w-0 truncate text-[12px] leading-normal font-bold text-white">
          {TODAY_QUESTION}
        </span>
      </section>

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
            {selectedLocationTitle && <Chip>{selectedLocationTitle}</Chip>}
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
                    key={member.id}
                    name={member.name}
                    avatarSrc={member.avatarSrc}
                    size="sm"
                    onRemove={() => removeMember(member.id)}
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
