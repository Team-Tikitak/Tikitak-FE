import type { StoredFeedHero as StoredFeedHeroData } from '../lib/feedHeroStorage';

interface StoredFeedHeroProps {
  storedFeedHero: StoredFeedHeroData;
}

export const StoredFeedHero = ({ storedFeedHero }: StoredFeedHeroProps) => {
  return (
    <img
      data-hero-exit-key={`pin-${storedFeedHero.feedId}`}
      data-hero-radius="4"
      src={storedFeedHero.thumbnailUrl}
      alt=""
      aria-hidden="true"
      className="no-native-image pointer-events-none absolute z-30 rounded-sm object-cover"
      style={{
        left: storedFeedHero.left,
        top: storedFeedHero.top,
        width: storedFeedHero.width,
        height: storedFeedHero.height,
      }}
    />
  );
};
