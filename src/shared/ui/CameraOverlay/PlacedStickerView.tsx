import { getSticker } from '@/shared/assets/Sticker/catalog';
import { type PlacedSticker } from '@/shared/types/sticker';

interface PlacedStickerViewProps {
  sticker: PlacedSticker;
  isActive: boolean;
}

const BASE_STICKER_SIZE_PX = 88;
const HIT_SLOP_PX = 24;

export const PlacedStickerView = ({ sticker, isActive }: PlacedStickerViewProps) => {
  const { Component, label } = getSticker(sticker.stickerId);

  return (
    <div
      data-sticker-id={sticker.id}
      data-active={isActive || undefined}
      role="img"
      aria-label={`${label} 스티커`}
      style={{
        left: `${sticker.xRatio * 100}%`,
        top: `${sticker.yRatio * 100}%`,
        width: BASE_STICKER_SIZE_PX + HIT_SLOP_PX * 2,
        height: BASE_STICKER_SIZE_PX + HIT_SLOP_PX * 2,
        transform: `translate(-50%, -50%) rotate(${sticker.rotation ?? 0}deg) scale(${sticker.scale})`,
      }}
      className="absolute touch-none p-6 will-change-transform select-none"
    >
      <Component className="size-full" aria-hidden="true" />
    </div>
  );
};
