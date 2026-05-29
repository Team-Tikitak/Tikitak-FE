import { type ComponentPropsWithRef, useRef } from 'react';
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
};

const LONG_PRESS_DELAY = 800;
const MOVE_CANCEL_THRESHOLD = 6;

export function FeedImageDetail({
  src,
  alt = '',
  pins = [],
  onLongPress,
  heroKey,
  className,
  ref,
  ...props
}: FeedImageDetailProps) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startPosRef = useRef<{ x: number; y: number } | null>(null);

  const handlePointerDown = (e: React.PointerEvent<HTMLElement>) => {
    const { x: xRatio, y: yRatio } = getPointerRatio(e, e.currentTarget);
    const x = xRatio * 100;
    const y = yRatio * 100;
    startPosRef.current = { x: e.clientX, y: e.clientY };

    timerRef.current = setTimeout(() => {
      timerRef.current = null;
      startPosRef.current = null;

      if (typeof window !== 'undefined') {
        window.getSelection()?.removeAllRanges();
      }
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

  return (
    <figure
      className={cn(
        'relative h-[524px] w-full shrink-0 overflow-hidden bg-white select-none [-webkit-touch-callout:none] [-webkit-user-select:none]',
        className,
      )}
      ref={ref}
      onContextMenu={(e) => e.preventDefault()}
      {...(heroKey ? { 'data-hero-enter-key': heroKey } : {})}
      {...props}
    >
      <img
        src={src}
        alt={alt}
        className="no-native-image h-full w-full object-cover"
        draggable={false}
      />
      <div
        className="absolute inset-0 touch-none"
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
