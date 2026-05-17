import { type PointerEvent, type RefObject, useRef } from 'react';
import { getPointerRatio } from '@/shared/lib';

interface UsePinchDragOptions {
  id: string;
  scale: number;
  containerRef: RefObject<HTMLElement | null>;
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
  minScale?: number;
  maxScale?: number;
}

export const usePinchDrag = ({
  id,
  scale,
  containerRef,
  onDragStart,
  onDragMove,
  onDragEnd,
  onScale,
  minScale = 0.4,
  maxScale = 3,
}: UsePinchDragOptions) => {
  const pointersRef = useRef(new Map<number, { x: number; y: number }>());
  const pinchStartRef = useRef<{ distance: number; scale: number } | null>(null);
  const isDraggingRef = useRef(false);

  const handlePointerDown = (event: PointerEvent<HTMLElement>) => {
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    pointersRef.current.set(event.pointerId, { x: event.clientX, y: event.clientY });

    if (pointersRef.current.size === 1) {
      isDraggingRef.current = true;
      onDragStart(id);
    } else if (pointersRef.current.size === 2) {
      const [p1, p2] = Array.from(pointersRef.current.values());
      pinchStartRef.current = {
        distance: Math.hypot(p2.x - p1.x, p2.y - p1.y),
        scale,
      };
    }
  };

  const handlePointerMove = (event: PointerEvent<HTMLElement>) => {
    if (!pointersRef.current.has(event.pointerId)) return;
    pointersRef.current.set(event.pointerId, { x: event.clientX, y: event.clientY });

    if (pointersRef.current.size === 2 && pinchStartRef.current) {
      const [p1, p2] = Array.from(pointersRef.current.values());
      const currentDistance = Math.hypot(p2.x - p1.x, p2.y - p1.y);
      const nextScale =
        pinchStartRef.current.scale * (currentDistance / pinchStartRef.current.distance);
      onScale(id, Math.min(maxScale, Math.max(minScale, nextScale)));
      return;
    }

    if (pointersRef.current.size === 1 && isDraggingRef.current) {
      const container = containerRef.current;
      if (!container) return;
      const { x: xRatio, y: yRatio } = getPointerRatio(event, container);
      onDragMove(id, xRatio, yRatio, event.clientX, event.clientY);
    }
  };

  const handlePointerUp = (event: PointerEvent<HTMLElement>) => {
    const wasPinch = pointersRef.current.size === 2;
    pointersRef.current.delete(event.pointerId);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    if (pointersRef.current.size < 2) {
      pinchStartRef.current = null;
    }
    if (wasPinch && pointersRef.current.size === 1 && isDraggingRef.current) {
      onDragStart(id);
    }
    if (pointersRef.current.size === 0 && isDraggingRef.current) {
      isDraggingRef.current = false;
      onDragEnd(id);
    }
  };

  return { handlePointerDown, handlePointerMove, handlePointerUp };
};
