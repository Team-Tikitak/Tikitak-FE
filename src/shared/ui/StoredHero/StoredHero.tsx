import { cn } from '@/shared/lib';
import type { StoredHero as StoredHeroData } from '@/shared/lib/hero/heroStorage';

interface StoredHeroProps {
  storedHero: StoredHeroData;
  visible?: boolean;
  radius?: string;
}

export const StoredHero = ({ storedHero, visible = true, radius = '4' }: StoredHeroProps) => {
  return (
    <img
      data-stored-hero
      data-hero-exit-key={storedHero.heroKey}
      data-hero-radius={radius}
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
};
