import { cn } from '@/shared/lib';
import { notificationHeroKey } from '../lib/notificationHeroKey';
import type { StoredNotificationHero as StoredNotificationHeroData } from '../lib/notificationHeroStorage';

interface StoredNotificationHeroProps {
  storedHero: StoredNotificationHeroData;
  visible?: boolean;
}

export const StoredNotificationHero = ({
  storedHero,
  visible = true,
}: StoredNotificationHeroProps) => (
  <img
    data-stored-notification-hero
    data-hero-exit-key={notificationHeroKey(storedHero.feedId, storedHero.notificationId)}
    data-hero-radius="4"
    src={storedHero.thumbnailUrl}
    alt=""
    aria-hidden="true"
    className={cn(
      'no-native-image pointer-events-none absolute z-30 rounded-sm object-cover',
      visible ? 'opacity-100' : 'opacity-0',
    )}
    style={{
      left: storedHero.left,
      top: storedHero.top,
      width: storedHero.width,
      height: storedHero.height,
    }}
  />
);
