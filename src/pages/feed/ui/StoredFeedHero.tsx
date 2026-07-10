import { cn } from '@/shared/lib';
import type { StoredFeedHero as StoredFeedHeroData } from '../lib/feedHeroStorage';

interface StoredFeedHeroProps {
  storedFeedHero: StoredFeedHeroData;
  visible?: boolean;
}

export const StoredFeedHero = ({ storedFeedHero, visible = true }: StoredFeedHeroProps) => {
  return (
    <img
      data-stored-feed-hero
      data-hero-exit-key={`pin-${storedFeedHero.feedId}`}
      data-hero-radius="4"
      src={storedFeedHero.thumbnailUrl}
      alt=""
      aria-hidden="true"
      className={cn(
        'no-native-image pointer-events-none absolute z-30 rounded-sm object-cover',
        visible ? 'opacity-100' : 'opacity-0',
      )}
      style={{
        left: storedFeedHero.left,
        top: storedFeedHero.top,
        width: storedFeedHero.width,
        height: storedFeedHero.height,
      }}
    />
  );
};
