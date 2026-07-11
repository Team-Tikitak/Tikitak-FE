import { getSticker } from '@/shared/assets/Sticker/catalog';
import { cn } from '@/shared/lib';
import { type PlacedSticker } from '@/shared/types/sticker';

interface PlacedStickerViewProps {
  sticker: PlacedSticker;
  isActive: boolean;
  isDropping?: boolean;
}

const BASE_STICKER_SIZE_PX = 88;
const HIT_SLOP_PX = 24;

export const PlacedStickerView = ({
  sticker,
  isActive,
  isDropping = false,
}: PlacedStickerViewProps) => {
  const { Component, label } = getSticker(sticker.stickerId);

  return (
    <div
      data-sticker-id={sticker.id}
      data-active={isActive || undefined}
      data-dropping={isDropping || undefined}
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
      <Component
        className={cn(
          'size-full transition-[filter,opacity,transform] duration-180 ease-[cubic-bezier(0.2,0.8,0.2,1)] will-change-transform',
          isActive && !isDropping && 'scale-[1.03]',
          isDropping && 'scale-75 opacity-70 saturate-75',
        )}
        aria-hidden="true"
      />
    </div>
  );
};
