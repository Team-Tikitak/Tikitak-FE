import { type PointerEvent, type RefObject, useEffect, useRef } from 'react';
import { getPointerRatio } from '@/shared/lib';

const normalizeAngleDelta = (delta: number) => Math.atan2(Math.sin(delta), Math.cos(delta));

interface UsePinchDragOptions {
  id: string;
  scale: number;
  rotation: number;
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
  onRotate: (id: string, rotation: number) => void;
  minScale?: number;
  maxScale?: number;
}

export const usePinchDrag = ({
  id,
  scale,
  rotation,
  containerRef,
  onDragStart,
  onDragMove,
  onDragEnd,
  onScale,
  onRotate,
  minScale = 0.4,
  maxScale = 3,
}: UsePinchDragOptions) => {
  const pointersRef = useRef(new Map<number, { x: number; y: number }>());
  const pinchStartRef = useRef<{
    distance: number;
    angle: number;
    scale: number;
    rotation: number;
  } | null>(null);
  const isDraggingRef = useRef(false);
  const scaleRef = useRef(scale);
  const rotationRef = useRef(rotation);
  useEffect(() => {
    scaleRef.current = scale;
  }, [scale]);
  useEffect(() => {
    rotationRef.current = rotation;
  }, [rotation]);

  const recomputePinchStart = () => {
    const [p1, p2] = Array.from(pointersRef.current.values());
    pinchStartRef.current = {
      distance: Math.hypot(p2.x - p1.x, p2.y - p1.y),
      angle: Math.atan2(p2.y - p1.y, p2.x - p1.x),
      scale: scaleRef.current,
      rotation: rotationRef.current,
    };
  };

  const handlePointerDown = (event: PointerEvent<HTMLElement>) => {
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    pointersRef.current.set(event.pointerId, { x: event.clientX, y: event.clientY });

    if (pointersRef.current.size === 1) {
      isDraggingRef.current = true;
      onDragStart(id);
    } else if (pointersRef.current.size === 2) {
      recomputePinchStart();
    }
  };

  const handlePointerMove = (event: PointerEvent<HTMLElement>) => {
    if (!pointersRef.current.has(event.pointerId)) return;
    pointersRef.current.set(event.pointerId, { x: event.clientX, y: event.clientY });

    if (pointersRef.current.size === 2 && pinchStartRef.current) {
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

    if (pointersRef.current.size === 2) {
      recomputePinchStart();
    } else {
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

  return {
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    handlePointerCancel: handlePointerUp,
  };
};
