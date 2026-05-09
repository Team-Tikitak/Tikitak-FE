import { cn } from '@/shared/lib';
import { Picker } from '../Picker/Picker';
import type { ComponentPropsWithRef } from 'react';

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

type FeedImageDetailProps = ComponentPropsWithRef<'figure'> & {
  src: string;
  alt?: string;
  pins?: Pin[];
};

export function FeedImageDetail({
  src,
  alt = '',
  pins = [],
  className,
  ref,
  ...props
}: FeedImageDetailProps) {
  return (
    <figure
      className={cn('relative w-full shrink-0 overflow-hidden', className)}
      ref={ref}
      {...props}
    >
      <img src={src} alt={alt} className="h-full w-full object-cover" draggable={false} />
      {pins.map((pin) => (
        <Picker
          key={pin.id}
          {...pin}
          variant={pin.variant}
          onClick={pin.onClick}
          className="absolute -translate-y-full"
          style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
        />
      ))}
    </figure>
  );
}
