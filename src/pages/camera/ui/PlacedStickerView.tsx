import { getSticker } from '@/shared/assets/Sticker/catalog';
import { usePinchDrag } from '../hooks/usePinchDrag';
import { type PlacedSticker } from '../model/types';

interface PlacedStickerViewProps {
  sticker: PlacedSticker;
  containerRef: React.RefObject<HTMLElement | null>;
  onDragStart: (id: string) => void;
  onDragMove: (
    id: string,
    xRatio: number,
    yRatio: number,
    screenX: number,
    screenY: number,
  ) => void;
  onDragEnd: (id: string) => void;
  onScale: (id: string, scale: number) => void;
}

const BASE_STICKER_SIZE_PX = 88;

export const PlacedStickerView = ({
  sticker,
  containerRef,
  onDragStart,
  onDragMove,
  onDragEnd,
  onScale,
}: PlacedStickerViewProps) => {
  const { Component, label } = getSticker(sticker.stickerId);
  const { handlePointerDown, handlePointerMove, handlePointerUp } = usePinchDrag({
    id: sticker.id,
    scale: sticker.scale,
    containerRef,
    onDragStart,
    onDragMove,
    onDragEnd,
    onScale,
  });

  const size = BASE_STICKER_SIZE_PX * sticker.scale;

  return (
    <button
      type="button"
      aria-label={`${label} 스티커 (드래그로 이동, 두 손가락으로 확대/축소, 쓰레기통으로 끌어 제거)`}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      style={{
        left: `${sticker.xRatio * 100}%`,
        top: `${sticker.yRatio * 100}%`,
        width: size,
        height: size,
      }}
      className="absolute -translate-x-1/2 -translate-y-1/2 touch-none select-none"
    >
      <Component className="size-full" aria-hidden="true" />
    </button>
  );
};
