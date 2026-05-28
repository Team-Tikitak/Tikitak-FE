import CameraIcon from '@/shared/assets/Icon/CameraIcon.svg?react';
import CloseIcon from '@/shared/assets/Icon/CloseIcon2.svg?react';

interface PhotoSlotProps {
  src: string | null;
  onAdd: () => void;
  onRemove: () => void;
  emptyLabel?: string;
}

export const PhotoSlot = ({ src, onAdd, onRemove, emptyLabel = '0/1' }: PhotoSlotProps) => (
  <button
    type="button"
    onClick={onAdd}
    className="press-feedback flex size-[112px] shrink-0 flex-col items-center justify-center gap-0.5 rounded-lg border border-gray-300 text-gray-900"
  >
    {src ? (
      <div className="relative size-full overflow-hidden rounded-lg">
        <img src={src} alt="" className="no-native-image size-full object-cover" />
        <button
          type="button"
          aria-label="사진 제거"
          onClick={(event) => {
            event.stopPropagation();
            onRemove();
          }}
          className="press-feedback absolute top-1 right-1 flex size-6 items-center justify-center rounded-full bg-black/60 text-white"
        >
          <CloseIcon className="size-4" />
        </button>
      </div>
    ) : (
      <>
        <CameraIcon className="size-6" aria-hidden="true" />
        <span className="button-6 text-gray-900">{emptyLabel}</span>
      </>
    )}
  </button>
);
