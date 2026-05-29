import { useRef, useState } from 'react';
import CancelIcon from '@/shared/assets/Icon/CancelIcon.svg?react';
import StickerIcon from '@/shared/assets/Icon/StickerIcon.svg?react';
import TrashIcon from '@/shared/assets/Icon/TrashIcon.svg?react';
import { type StickerId } from '@/shared/assets/Sticker/catalog';
import { useTrashDragZone } from '@/shared/hooks/useTrashDragZone';
import { cn } from '@/shared/lib';
import { type PlacedSticker } from '@/shared/types/sticker';
import { Button } from '@/shared/ui';
import { StickerPicker } from '@/shared/ui/StickerPicker/StickerPicker';
import { PlacedStickerView } from './PlacedStickerView';

interface CameraReviewProps {
  imageUrl: string;
  stickers: PlacedSticker[];
  isConfirming?: boolean;
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
  isConfirming = false,
  onAddSticker,
  onMoveSticker,
  onScaleSticker,
  onRemoveSticker,
  onRetake,
  onConfirm,
}: CameraReviewProps) => {
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const photoRef = useRef<HTMLDivElement>(null);
  const { trashRef, draggingId, isOverTrash, handleDragStart, handleDragMove, handleDragEnd } =
    useTrashDragZone({ onMove: onMoveSticker, onRemove: onRemoveSticker });

  const handleSelectSticker = (stickerId: StickerId) => {
    onAddSticker(stickerId);
    setIsPickerOpen(false);
  };

  return (
    <div className="relative flex h-full w-full flex-col justify-center bg-black">
      <div ref={photoRef} className="relative h-full w-full">
        <img
          src={imageUrl}
          alt="촬영된 사진"
          className="no-native-image h-full w-full object-cover"
        />
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
          <Button variant="primary" disabled={isConfirming} onClick={onConfirm}>
            업로드
          </Button>
        </div>
      )}

      <div
        ref={trashRef}
        aria-hidden={!draggingId}
        className={cn(
          'pointer-events-none absolute bottom-[calc(env(safe-area-inset-bottom)+24px)] left-1/2 z-30 flex size-12 -translate-x-1/2 items-center justify-center rounded-full transition-[opacity,transform,background-color] duration-200 ease-out',
          draggingId ? 'opacity-100' : 'opacity-0',
          isOverTrash ? 'scale-110 bg-red-500' : 'bg-[rgba(30,31,31,0.6)]',
        )}
      >
        <TrashIcon className="size-5 text-white" />
      </div>

      <StickerPicker
        open={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        onSelect={handleSelectSticker}
      />
    </div>
  );
};
