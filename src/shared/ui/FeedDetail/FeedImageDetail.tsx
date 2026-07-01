import { type ComponentPropsWithRef, useCallback, useEffect, useRef, useState } from 'react';
import { cn, getPointerRatio } from '@/shared/lib';
import { Picker } from '../Picker/Picker';

type PinAvatar = { id: string; src: string; alt?: string };

type PinBase = {
  id: string;
  x: number;
  y: number;
  variant?: 'default' | 'new';
  onClick?: () => void;
};

export type Pin =
  | (PinBase & { count?: 'single'; avatars: [PinAvatar] })
  | (PinBase & { count: 'multiple'; avatars: [PinAvatar, PinAvatar] });

export type PressPosition = { x: number; y: number };

type FeedImageDetailProps = ComponentPropsWithRef<'figure'> & {
  src: string;
  alt?: string;
  pins?: Pin[];
  onLongPress?: (position: PressPosition) => void;
  heroKey?: string;
  heroPreviewUrl?: string;
  previewOnly?: boolean;
  fetchPriority?: 'high' | 'low' | 'auto';
  loading?: 'eager' | 'lazy';
  decoding?: 'sync' | 'async' | 'auto';
};

const LONG_PRESS_DELAY = 800;
const MOVE_CANCEL_THRESHOLD = 6;

export function FeedImageDetail({
  src,
  alt = '',
  pins = [],
  onLongPress,
  heroKey,
  heroPreviewUrl,
  previewOnly = false,
  fetchPriority = 'auto',
  loading = 'lazy',
  decoding = 'async',
  className,
  ref,
  ...props
}: FeedImageDetailProps) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startPosRef = useRef<{ x: number; y: number } | null>(null);
  const figureRef = useRef<HTMLElement | null>(null);
  const naturalRef = useRef<{ width: number; height: number } | null>(null);
  const [loaded, setLoaded] = useState(false);
  // 이미지가 프레임(3:4)보다 넓으면(1:1·가로) contain으로 레터박스, 세로로 길면 cover로 꽉 채움
  const [fit, setFit] = useState<'cover' | 'contain'>('cover');

  const measureFit = useCallback(() => {
    const frame = figureRef.current;
    const natural = naturalRef.current;
    if (!frame || !natural || !natural.width || !natural.height) return;
    const frameAspect = frame.clientWidth / frame.clientHeight;
    const imageAspect = natural.width / natural.height;
    setFit(imageAspect > frameAspect ? 'contain' : 'cover');
  }, []);

  const captureNatural = useCallback(
    (image: HTMLImageElement) => {
      if (!image.naturalWidth || !image.naturalHeight) return;
      naturalRef.current = { width: image.naturalWidth, height: image.naturalHeight };
      measureFit();
    },
    [measureFit],
  );

  const assignImageRef = useCallback(
    (node: HTMLImageElement | null) => {
      if (node?.complete && node.naturalWidth > 0) {
        setLoaded(true);
        captureNatural(node);
      }
    },
    [captureNatural],
  );

  const assignPreviewRef = useCallback(
    (node: HTMLImageElement | null) => {
      if (node?.complete && node.naturalWidth > 0) {
        captureNatural(node);
      }
    },
    [captureNatural],
  );

  const assignFigureRef = (node: HTMLElement | null) => {
    figureRef.current = node;
    if (typeof ref === 'function') ref(node);
    else if (ref) (ref as React.RefObject<HTMLElement | null>).current = node;
  };

  useEffect(() => {
    const frame = figureRef.current;
    if (!frame || typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(() => measureFit());
    observer.observe(frame);
    return () => observer.disconnect();
  }, [measureFit]);

  const handlePointerDown = (e: React.PointerEvent<HTMLElement>) => {
    const { x: xRatio, y: yRatio } = getPointerRatio(e, e.currentTarget);
    const x = xRatio * 100;
    const y = yRatio * 100;
    startPosRef.current = { x: e.clientX, y: e.clientY };

    timerRef.current = setTimeout(() => {
      timerRef.current = null;
      startPosRef.current = null;
      window.getSelection()?.removeAllRanges();
      onLongPress?.({ x, y });
    }, LONG_PRESS_DELAY);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLElement>) => {
    if (!timerRef.current || !startPosRef.current) return;

    const dx = e.clientX - startPosRef.current.x;
    const dy = e.clientY - startPosRef.current.y;

    if (dx * dx + dy * dy > MOVE_CANCEL_THRESHOLD ** 2) {
      cancelLongPress();
    }
  };

  const cancelLongPress = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    startPosRef.current = null;
  };

  const fitClassName = fit === 'contain' ? 'object-contain' : 'object-cover';

  return (
    <figure
      className={cn(
        'relative h-[min(524px,calc(100svh-240px))] min-h-[360px] w-full shrink-0 overflow-hidden bg-black select-none [-webkit-touch-callout:none] [-webkit-user-select:none]',
        className,
      )}
      ref={assignFigureRef}
      onContextMenu={(e) => e.preventDefault()}
      {...(heroKey ? { 'data-hero-enter-key': heroKey } : {})}
      {...props}
    >
      {heroPreviewUrl && (
        <img
          ref={assignPreviewRef}
          src={heroPreviewUrl}
          alt=""
          aria-hidden
          onLoad={(event) => captureNatural(event.currentTarget)}
          className={cn(
            'no-native-image absolute inset-0 h-full w-full blur-md transition-opacity duration-[160ms]',
            fitClassName,
            loaded && !previewOnly && 'opacity-0',
          )}
          draggable={false}
        />
      )}
      {!previewOnly && (
        <img
          ref={assignImageRef}
          src={src}
          alt={alt}
          loading={loading}
          decoding={decoding}
          fetchPriority={fetchPriority}
          onLoad={(event) => {
            setLoaded(true);
            captureNatural(event.currentTarget);
          }}
          className={cn(
            'no-native-image h-full w-full',
            fitClassName,
            heroPreviewUrl && 'absolute inset-0 transition-opacity duration-[160ms] ease-out',
            heroPreviewUrl && !loaded && 'opacity-0',
          )}
          draggable={false}
        />
      )}
      <div
        className="absolute inset-0 touch-pan-y"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={cancelLongPress}
        onPointerLeave={cancelLongPress}
        onPointerCancel={cancelLongPress}
      />
      {pins.map((pin) => (
        <Picker
          key={pin.id}
          {...(pin.count === 'multiple'
            ? { count: 'multiple', avatars: pin.avatars }
            : { avatars: pin.avatars })}
          variant={pin.variant}
          onClick={pin.onClick}
          className="absolute -translate-y-full"
          style={{ left: `${pin.x}%`, top: `${pin.y}%`, zIndex: 1 }}
        />
      ))}
    </figure>
  );
}
