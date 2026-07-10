import { type ComponentPropsWithRef } from 'react';
import { cn } from '@/shared/lib';
import { notificationHeroKey } from '../lib/notificationHeroKey';
import type { StoredNotificationHero as StoredNotificationHeroData } from '../lib/notificationHeroStorage';

interface StoredNotificationHeroProps extends Omit<
  ComponentPropsWithRef<'img'>,
  'src' | 'alt' | 'aria-hidden'
> {
  storedHero: StoredNotificationHeroData;
  visible?: boolean;
}

export const StoredNotificationHero = ({
  storedHero,
  visible = true,
  className,
  ref,
  style,
  ...props
}: StoredNotificationHeroProps) => (
  <img
    ref={ref}
    {...props}
    data-stored-notification-hero
    data-hero-exit-key={notificationHeroKey(storedHero.feedId, storedHero.notificationId)}
    data-hero-radius="4"
    src={storedHero.thumbnailUrl}
    alt=""
    aria-hidden="true"
    className={cn(
      'no-native-image pointer-events-none absolute z-30 rounded-sm object-cover',
      visible ? 'opacity-100' : 'opacity-0',
      className,
    )}
    style={{
      ...style,
      left: storedHero.left,
      top: storedHero.top,
      width: storedHero.width,
      height: storedHero.height,
    }}
  />
);
