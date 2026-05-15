import { useRef, useState } from 'react';
import CancelIcon from '@/shared/assets/Icon/CancelIcon.svg?react';
import CloseIcon2 from '@/shared/assets/Icon/CloseIcon2.svg?react';
import StickerIcon from '@/shared/assets/Icon/StickerIcon.svg?react';
import { type StickerId } from '@/shared/assets/Sticker/catalog';
import { cn } from '@/shared/lib';
import { Button } from '@/shared/ui';
import { StickerPicker } from '@/shared/ui/StickerPicker/StickerPicker';
import { PlacedStickerView } from './PlacedStickerView';
import { type PlacedSticker } from '../model/types';

interface CameraReviewProps {
  imageUrl: string;
  stickers: PlacedSticker[];
  onAddSticker: (stickerId: StickerId) => void;
  onMoveSticker: (id: string, xRatio: number, yRatio: number) => void;
  onScaleSticker: (id: string, scale: number) => void;
  onRemoveSticker: (id: string) => void;
  onRetake: () => void;
  onConfirm: () => void;
}

export const CameraReview = ({
  imageUrl,
  stickers,
  onAddSticker,
  onMoveSticker,
  onScaleSticker,
  onRemoveSticker,
  onRetake,
  onConfirm,
}: CameraReviewProps) => {
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [isOverTrash, setIsOverTrash] = useState(false);
  const photoRef = useRef<HTMLDivElement>(null);
  const trashRef = useRef<HTMLDivElement>(null);

  const handleSelectSticker = (stickerId: StickerId) => {
    onAddSticker(stickerId);
    setIsPickerOpen(false);
  };

  const isPointerOverTrash = (screenX: number, screenY: number) => {
    const trashEl = trashRef.current;
    if (!trashEl) return false;
    const rect = trashEl.getBoundingClientRect();
    return (
      screenX >= rect.left && screenX <= rect.right && screenY >= rect.top && screenY <= rect.bottom
    );
  };

  const handleDragStart = (id: string) => {
    setDraggingId(id);
    setIsOverTrash(false);
  };

  const handleDragMove = (
    id: string,
    xRatio: number,
    yRatio: number,
    screenX: number,
    screenY: number,
  ) => {
    const overTrash = isPointerOverTrash(screenX, screenY);
    setIsOverTrash(overTrash);
    if (!overTrash) {
      onMoveSticker(id, xRatio, yRatio);
    }
  };

  const handleDragEnd = (id: string) => {
    if (isOverTrash) {
      onRemoveSticker(id);
    }
    setDraggingId(null);
    setIsOverTrash(false);
  };

  return (
    <div className="relative flex h-full w-full flex-col justify-center bg-black">
      <div ref={photoRef} className="relative h-full w-full">
        <img src={imageUrl} alt="촬영된 사진" className="h-full w-full object-cover" />
        {stickers.map((sticker) => (
          <PlacedStickerView
            key={sticker.id}
            sticker={sticker}
            containerRef={photoRef}
            onDragStart={handleDragStart}
            onDragMove={handleDragMove}
            onDragEnd={handleDragEnd}
            onScale={onScaleSticker}
          />
        ))}
      </div>

      <button
        type="button"
        aria-label="재촬영"
        onClick={onRetake}
        className="press-feedback absolute top-[calc(env(safe-area-inset-top)+24px)] left-6 z-10"
      >
        <CancelIcon className="size-9" />
      </button>
      <button
        type="button"
        aria-label="스티커 추가"
        aria-pressed={isPickerOpen}
        onClick={() => setIsPickerOpen((prev) => !prev)}
        className="press-feedback absolute top-[calc(env(safe-area-inset-top)+24px)] right-6 z-10"
      >
        <StickerIcon className="size-9" />
      </button>

      {!isPickerOpen && !draggingId && (
        <div className="absolute right-0 bottom-[calc(env(safe-area-inset-bottom)+16px)] left-0 z-10 px-5">
          <Button variant="primary" onClick={onConfirm}>
            업로드
          </Button>
        </div>
      )}

      <div
        ref={trashRef}
        aria-hidden={!draggingId}
        className={cn(
          'pointer-events-none absolute bottom-[calc(env(safe-area-inset-bottom)+24px)] left-1/2 z-30 flex size-12 -translate-x-1/2 items-center justify-center rounded-full transition-all duration-150',
          draggingId ? 'opacity-100' : 'opacity-0',
          isOverTrash ? 'scale-125 bg-red-500' : 'bg-[rgba(30,31,31,0.6)]',
        )}
      >
        <CloseIcon2 className="size-5 text-white" />
      </div>

      <StickerPicker
        open={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        onSelect={handleSelectSticker}
      />
    </div>
  );
};
