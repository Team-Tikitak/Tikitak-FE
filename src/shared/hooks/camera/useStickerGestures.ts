import { type PointerEvent, type RefObject, useEffect, useRef, useState } from 'react';
import { getPointerRatio } from '@/shared/lib';
import { type PlacedSticker } from '@/shared/types/sticker';

const normalizeAngleDelta = (delta: number) => Math.atan2(Math.sin(delta), Math.cos(delta));

interface UseStickerGesturesOptions {
  containerRef: RefObject<HTMLElement | null>;
  stickers: PlacedSticker[];
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
  minScale?: number;
  maxScale?: number;
}

export const useStickerGestures = ({
  containerRef,
  stickers,
  onDragStart,
  onDragMove,
  onDragEnd,
  onScale,
  onRotate,
  minScale = 0.4,
  maxScale = 3,
}: UseStickerGesturesOptions) => {
  const [activeId, setActiveId] = useState<string | null>(null);
  const activeIdRef = useRef<string | null>(null);
  const stickersRef = useRef(stickers);
  const pointersRef = useRef(new Map<number, { x: number; y: number }>());
  const dragSessionRef = useRef(false);
  const dragMoveEnabledRef = useRef(false);
  const pinchStartRef = useRef<{
    distance: number;
    angle: number;
    scale: number;
    rotation: number;
  } | null>(null);

  useEffect(() => {
    stickersRef.current = stickers;
  }, [stickers]);

  const updateActive = (id: string | null) => {
    activeIdRef.current = id;
    setActiveId(id);
  };

  const getActiveSticker = () =>
    stickersRef.current.find((sticker) => sticker.id === activeIdRef.current) ?? null;

  const recomputePinchStart = () => {
    const sticker = getActiveSticker();
    const points = Array.from(pointersRef.current.values());
    if (!sticker || points.length < 2) {
      pinchStartRef.current = null;
      return;
    }
    const [p1, p2] = points;
    pinchStartRef.current = {
      distance: Math.hypot(p2.x - p1.x, p2.y - p1.y),
      angle: Math.atan2(p2.y - p1.y, p2.x - p1.x),
      scale: sticker.scale,
      rotation: sticker.rotation ?? 0,
    };
  };

  const handlePointerDown = (event: PointerEvent<HTMLElement>) => {
    const target = event.target as Element;
    if (target.closest('[data-sticker-control]')) return;

    if (pointersRef.current.size === 0) {
      const stickerEl = target.closest<HTMLElement>('[data-sticker-id]');
      if (!stickerEl?.dataset.stickerId) {
        updateActive(null);
        return;
      }
      updateActive(stickerEl.dataset.stickerId);
    }
    if (!activeIdRef.current) return;

    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    pointersRef.current.set(event.pointerId, { x: event.clientX, y: event.clientY });

    if (pointersRef.current.size === 1) {
      dragMoveEnabledRef.current = true;
      if (!dragSessionRef.current) {
        dragSessionRef.current = true;
        onDragStart(activeIdRef.current);
      }
    } else if (pointersRef.current.size === 2) {
      dragMoveEnabledRef.current = false;
      recomputePinchStart();
    }
  };

  const handlePointerMove = (event: PointerEvent<HTMLElement>) => {
    if (!pointersRef.current.has(event.pointerId)) return;
    pointersRef.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    const id = activeIdRef.current;
    if (!id) return;

    if (pointersRef.current.size >= 2 && pinchStartRef.current) {
      const [p1, p2] = Array.from(pointersRef.current.values());
      const currentDistance = Math.hypot(p2.x - p1.x, p2.y - p1.y);
      const currentAngle = Math.atan2(p2.y - p1.y, p2.x - p1.x);
      const nextScale =
        pinchStartRef.current.scale * (currentDistance / pinchStartRef.current.distance);
      const nextRotation =
        pinchStartRef.current.rotation +
        (normalizeAngleDelta(currentAngle - pinchStartRef.current.angle) * 180) / Math.PI;
      onScale(id, Math.min(maxScale, Math.max(minScale, nextScale)));
      onRotate(id, nextRotation);
      return;
    }

    if (pointersRef.current.size === 1 && dragMoveEnabledRef.current) {
      const container = containerRef.current;
      if (!container) return;
      const { x: xRatio, y: yRatio } = getPointerRatio(event, container);
      onDragMove(id, xRatio, yRatio, event.clientX, event.clientY);
    }
  };

  const handlePointerUp = (event: PointerEvent<HTMLElement>) => {
    if (!pointersRef.current.has(event.pointerId)) return;
    pointersRef.current.delete(event.pointerId);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    const id = activeIdRef.current;

    if (pointersRef.current.size >= 2) {
      recomputePinchStart();
    } else {
      pinchStartRef.current = null;
      dragMoveEnabledRef.current = false;
    }

    if (pointersRef.current.size === 0) {
      if (dragSessionRef.current && id) onDragEnd(id);
      dragSessionRef.current = false;
    }
  };

  return {
    activeId,
    setActiveId: updateActive,
    stickerGestureProps: {
      onPointerDown: handlePointerDown,
      onPointerMove: handlePointerMove,
      onPointerUp: handlePointerUp,
      onPointerCancel: handlePointerUp,
    },
  };
};
