import { type PointerEvent, useRef } from 'react';
import { getSticker } from '@/shared/assets/Sticker/catalog';
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
const MIN_SCALE = 0.4;
const MAX_SCALE = 3;

export const PlacedStickerView = ({
  sticker,
  containerRef,
  onDragStart,
  onDragMove,
  onDragEnd,
  onScale,
}: PlacedStickerViewProps) => {
  const { Component, label } = getSticker(sticker.stickerId);
  const pointersRef = useRef(new Map<number, { x: number; y: number }>());
  const pinchStartRef = useRef<{ distance: number; scale: number } | null>(null);
  const isDraggingRef = useRef(false);

  const handlePointerDown = (event: PointerEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    pointersRef.current.set(event.pointerId, { x: event.clientX, y: event.clientY });

    if (pointersRef.current.size === 1) {
      isDraggingRef.current = true;
      onDragStart(sticker.id);
    } else if (pointersRef.current.size === 2) {
      const [p1, p2] = Array.from(pointersRef.current.values());
      pinchStartRef.current = {
        distance: Math.hypot(p2.x - p1.x, p2.y - p1.y),
        scale: sticker.scale,
      };
    }
  };

  const handlePointerMove = (event: PointerEvent<HTMLButtonElement>) => {
    if (!pointersRef.current.has(event.pointerId)) return;
    pointersRef.current.set(event.pointerId, { x: event.clientX, y: event.clientY });

    if (pointersRef.current.size === 2 && pinchStartRef.current) {
      const [p1, p2] = Array.from(pointersRef.current.values());
      const currentDistance = Math.hypot(p2.x - p1.x, p2.y - p1.y);
      const nextScale =
        pinchStartRef.current.scale * (currentDistance / pinchStartRef.current.distance);
      const clamped = Math.min(MAX_SCALE, Math.max(MIN_SCALE, nextScale));
      onScale(sticker.id, clamped);
      return;
    }

    if (pointersRef.current.size === 1 && isDraggingRef.current) {
      const container = containerRef.current;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const xRatio = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
      const yRatio = Math.min(1, Math.max(0, (event.clientY - rect.top) / rect.height));
      onDragMove(sticker.id, xRatio, yRatio, event.clientX, event.clientY);
    }
  };

  const handlePointerUp = (event: PointerEvent<HTMLButtonElement>) => {
    pointersRef.current.delete(event.pointerId);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    if (pointersRef.current.size < 2) {
      pinchStartRef.current = null;
    }
    if (pointersRef.current.size === 0 && isDraggingRef.current) {
      isDraggingRef.current = false;
      onDragEnd(sticker.id);
    }
  };

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
