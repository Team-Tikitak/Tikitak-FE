import CameraIcon from '@/shared/assets/Icon/CameraIcon.svg?react';
import CloseIcon from '@/shared/assets/Icon/CloseIcon2.svg?react';

export interface PhotoSlotProps {
  src: string | null;
  onAdd: () => void;
  onRemove: () => void;
  emptyLabel?: string;
  // 카메라 합성이 아직 끝나지 않은 새 사진이 있음(완성되면 src로 교체됨)
  isPending?: boolean;
}

export const PhotoSlot = ({
  src,
  onAdd,
  onRemove,
  emptyLabel = '0/1',
  isPending = false,
}: PhotoSlotProps) => {
  if (isPending) {
    return (
      <div
        role="status"
        aria-label="사진 처리 중"
        className="size-[112px] shrink-0 animate-pulse rounded-lg bg-gray-200"
      />
    );
  }

  if (src) {
    return (
      <div className="relative size-[112px] shrink-0 overflow-hidden rounded-lg border border-gray-300">
        <img src={src} alt="" className="no-native-image size-full object-cover" />
        <button
          type="button"
          aria-label="사진 제거"
          onClick={onRemove}
          className="press-feedback absolute top-1.5 right-1.5 flex size-5 items-center justify-center rounded-full bg-black/80 text-white"
        >
          <CloseIcon className="size-2.5" />
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onAdd}
      className="press-feedback flex size-[112px] shrink-0 flex-col items-center justify-center gap-0.5 rounded-lg border border-gray-300 text-gray-900"
    >
      <CameraIcon className="size-6" aria-hidden="true" />
      <span className="button-6 text-gray-900">{emptyLabel}</span>
    </button>
  );
};
