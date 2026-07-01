import { useState, useRef, type ComponentPropsWithRef } from 'react';
import { cn } from '@/shared/lib';
import { FeedImageDetail, type Pin, type PressPosition } from './FeedImageDetail';

export type CarouselImage = {
  src: string;
  alt?: string;
  pins?: Pin[];
  heroPreviewUrl?: string;
  previewOnly?: boolean;
};

type FeedImageCarouselProps = ComponentPropsWithRef<'div'> & {
  images: CarouselImage[];
  onLongPress?: (position: PressPosition, imageIndex: number) => void;
  heroKey?: string;
};

const SWIPE_THRESHOLD = 50;
const AXIS_LOCK_THRESHOLD = 10;

export function FeedImageCarousel({
  images,
  onLongPress,
  heroKey,
  className,
  ref,
  ...props
}: FeedImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startPosRef = useRef<{ x: number; y: number } | null>(null);
  const hasCapturedRef = useRef(false);
  const axisRef = useRef<'horizontal' | 'vertical' | null>(null);

  const handlePointerDown = (e: React.PointerEvent) => {
    startPosRef.current = { x: e.clientX, y: e.clientY };
    hasCapturedRef.current = false;
    axisRef.current = null;
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!startPosRef.current) return;

    const diff = e.clientX - startPosRef.current.x;
    const verticalDiff = e.clientY - startPosRef.current.y;

    if (!axisRef.current) {
      const absX = Math.abs(diff);
      const absY = Math.abs(verticalDiff);
      if (absX < AXIS_LOCK_THRESHOLD && absY < AXIS_LOCK_THRESHOLD) return;
      axisRef.current = absX > absY ? 'horizontal' : 'vertical';
    }

    if (axisRef.current === 'vertical') return;

    if (!hasCapturedRef.current && Math.abs(diff) > 10) {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      hasCapturedRef.current = true;
      setIsDragging(true);
    }

    const isAtStart = currentIndex === 0 && diff > 0;
    const isAtEnd = currentIndex === images.length - 1 && diff < 0;

    if (isAtStart || isAtEnd) return;

    setDragOffset(diff);
  };

  const resetDrag = (e: React.PointerEvent) => {
    if (!startPosRef.current) return;

    if (axisRef.current !== 'horizontal') {
      setIsDragging(false);
      setDragOffset(0);
      startPosRef.current = null;
      axisRef.current = null;
      return;
    }

    const diff = startPosRef.current.x - e.clientX;
    setIsDragging(false);
    setDragOffset(0);

    if (diff > SWIPE_THRESHOLD && currentIndex < images.length - 1) {
      setCurrentIndex((i) => i + 1);
    } else if (diff < -SWIPE_THRESHOLD && currentIndex > 0) {
      setCurrentIndex((i) => i - 1);
    }
    startPosRef.current = null;
    axisRef.current = null;
  };

  if (images.length === 0) return null;

  return (
    <div className={cn('flex w-full flex-col items-center gap-3', className)} ref={ref} {...props}>
      <div className="relative w-full overflow-hidden">
        <div
          className={cn('flex touch-pan-y', !isDragging && 'transition-transform duration-300')}
          style={{ transform: `translateX(calc(-${currentIndex * 100}% + ${dragOffset}px))` }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={resetDrag}
          onPointerCancel={resetDrag}
        >
          {images.map((image, index) => (
            <FeedImageDetail
              key={index}
              src={image.src}
              alt={image.alt}
              pins={image.pins}
              heroPreviewUrl={image.heroPreviewUrl}
              previewOnly={image.previewOnly}
              onLongPress={onLongPress && ((position) => onLongPress(position, index))}
              heroKey={index === 0 ? heroKey : undefined}
              fetchPriority={index === 0 ? 'high' : 'auto'}
              loading="eager"
              decoding={index === 0 ? 'sync' : 'async'}
            />
          ))}
        </div>
        {images.length > 1 && (
          <span className="button-6 absolute top-4 right-3 rounded-full bg-[rgba(30,31,31,0.6)] px-2.5 py-1 text-white">
            {currentIndex + 1}/{images.length}
          </span>
        )}
      </div>

      {images.length > 1 && (
        <div className="flex gap-1.5">
          {images.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setCurrentIndex(i)}
              className={cn(
                'size-1.5 rounded-full transition-colors',
                i === currentIndex ? 'bg-main-001' : 'bg-gray-300',
              )}
              aria-label={`${i + 1}번째 사진`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
