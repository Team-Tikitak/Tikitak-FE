import { getSticker } from '@/shared/assets/Sticker/catalog';
import { usePinchDrag } from '@/shared/hooks/camera/usePinchDrag';
import { type PlacedSticker } from '@/shared/types/sticker';

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
  onRotate: (id: string, rotation: number) => void;
}

const BASE_STICKER_SIZE_PX = 88;

export const PlacedStickerView = ({
  sticker,
  containerRef,
  onDragStart,
  onDragMove,
  onDragEnd,
  onScale,
  onRotate,
}: PlacedStickerViewProps) => {
  const { Component, label } = getSticker(sticker.stickerId);
  const { handlePointerDown, handlePointerMove, handlePointerUp, handlePointerCancel } =
    usePinchDrag({
      id: sticker.id,
      scale: sticker.scale,
      rotation: sticker.rotation ?? 0,
      containerRef,
      onDragStart,
      onDragMove,
      onDragEnd,
      onScale,
      onRotate,
    });

  const size = BASE_STICKER_SIZE_PX * sticker.scale;
  const hitSlop = 12;

  return (
    <button
      type="button"
      aria-label={`${label} 스티커 (드래그로 이동, 두 손가락으로 확대/축소/회전, 쓰레기통으로 끌어 제거)`}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
      style={{
        left: `${sticker.xRatio * 100}%`,
        top: `${sticker.yRatio * 100}%`,
        width: size + hitSlop * 2,
        height: size + hitSlop * 2,
        transform: `translate(-50%, -50%) rotate(${sticker.rotation ?? 0}deg)`,
      }}
      className="absolute touch-none p-3 select-none"
    >
      <Component className="size-full" aria-hidden="true" />
    </button>
  );
};
