import { type ComponentPropsWithRef, useRef } from 'react';
import { cn } from '@/shared/lib';
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
};

const LONG_PRESS_DELAY = 500;

export function FeedImageDetail({
  src,
  alt = '',
  pins = [],
  onLongPress,
  className,
  ref,
  ...props
}: FeedImageDetailProps) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handlePointerDown = (e: React.PointerEvent<HTMLElement>) => {
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    timerRef.current = setTimeout(() => {
      timerRef.current = null;
      onLongPress?.({ x, y });
    }, LONG_PRESS_DELAY);
  };

  const cancelLongPress = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  return (
    <figure
      className={cn('relative w-full shrink-0 overflow-hidden', className)}
      ref={ref}
      onPointerDown={handlePointerDown}
      onPointerUp={cancelLongPress}
      onPointerLeave={cancelLongPress}
      onPointerCancel={cancelLongPress}
      onContextMenu={(e) => e.preventDefault()}
      {...props}
    >
      <img src={src} alt={alt} className="h-full w-full object-cover" draggable={false} />
      {pins.map((pin) => (
        <Picker
          key={pin.id}
          {...(pin.count === 'multiple'
            ? { count: 'multiple', avatars: pin.avatars }
            : { avatars: pin.avatars })}
          variant={pin.variant}
          onClick={pin.onClick}
          className="absolute -translate-y-full"
          style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
        />
      ))}
    </figure>
  );
}
