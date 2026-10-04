import CameraIcon from '@/shared/assets/Icon/CameraIcon.svg?react';
import CloseIcon from '@/shared/assets/Icon/CloseIcon2.svg?react';

export interface PhotoStripItem {
  key: string;
  src: string;
  onRemove: () => void;
}

export interface PhotoStripProps {
  items: PhotoStripItem[];
  count: number;
  maxPhotoCount: number;
  canAddMore: boolean;
  onAddPhoto: () => void;
  // 카메라 합성이 아직 끝나지 않은 사진 수(자리표시자로 표시)
  pendingCount?: number;
}

export const PhotoStrip = ({
  items,
  count,
  maxPhotoCount,
  canAddMore,
  onAddPhoto,
  pendingCount = 0,
}: PhotoStripProps) => (
  <div className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5">
    <button
      type="button"
      onClick={onAddPhoto}
      disabled={!canAddMore}
      className="press-feedback flex size-[112px] shrink-0 flex-col items-center justify-center gap-0.5 rounded-lg border border-gray-300 text-gray-900 disabled:opacity-50"
    >
      <CameraIcon className="size-6" aria-hidden="true" />
      <span className="button-6 text-gray-900">
        {count}/{maxPhotoCount}
      </span>
    </button>
    {items.map((item) => (
      <div key={item.key} className="relative size-[112px] shrink-0 overflow-hidden rounded-lg">
        <img src={item.src} alt="" className="no-native-image size-full object-cover" />
        <button
          type="button"
          aria-label="사진 제거"
          onClick={item.onRemove}
          className="press-feedback absolute top-1.5 right-1.5 flex size-5 items-center justify-center rounded-full bg-black/80 text-white"
        >
          <CloseIcon className="size-2.5" />
        </button>
      </div>
    ))}
    {Array.from({ length: pendingCount }, (_, index) => (
      <div
        key={`pending-${index}`}
        role="status"
        aria-label="사진 처리 중"
        className="size-[112px] shrink-0 animate-pulse rounded-lg bg-gray-200"
      />
    ))}
  </div>
);
