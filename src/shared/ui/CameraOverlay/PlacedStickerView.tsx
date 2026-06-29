import { getSticker } from '@/shared/assets/Sticker/catalog';
import { cn } from '@/shared/lib';
import { type PlacedSticker } from '@/shared/types/sticker';

interface PlacedStickerViewProps {
  sticker: PlacedSticker;
  isActive: boolean;
}

const BASE_STICKER_SIZE_PX = 88;
const HIT_SLOP_PX = 12;

export const PlacedStickerView = ({ sticker, isActive }: PlacedStickerViewProps) => {
  const { Component, label } = getSticker(sticker.stickerId);

  return (
    <div
      data-sticker-id={sticker.id}
      role="img"
      aria-label={`${label} 스티커`}
      style={{
        left: `${sticker.xRatio * 100}%`,
        top: `${sticker.yRatio * 100}%`,
        width: BASE_STICKER_SIZE_PX + HIT_SLOP_PX * 2,
        height: BASE_STICKER_SIZE_PX + HIT_SLOP_PX * 2,
        transform: `translate(-50%, -50%) rotate(${sticker.rotation ?? 0}deg) scale(${sticker.scale})`,
      }}
      className={cn(
        'absolute touch-none p-3 will-change-transform select-none',
        isActive && 'rounded-2xl ring-2 ring-white/90',
      )}
    >
      <Component className="size-full" aria-hidden="true" />
    </div>
  );
};
