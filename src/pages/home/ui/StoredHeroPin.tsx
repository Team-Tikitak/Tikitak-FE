import { MapImage } from './MapImage';
import {
  getStoredHeroPinStyle,
  type StoredHeroPin as StoredHeroPinData,
} from '../lib/heroPinStorage';

interface StoredHeroPinProps {
  storedHeroPin: StoredHeroPinData;
  pinSize: number;
}

export const StoredHeroPin = ({ storedHeroPin, pinSize }: StoredHeroPinProps) => {
  return (
    <MapImage
      data-hero-exit-key={`pin-${storedHeroPin.placeId}`}
      src={storedHeroPin.thumbnailUrl}
      count={storedHeroPin.feedCount}
      className="pointer-events-none"
      style={getStoredHeroPinStyle(storedHeroPin, pinSize)}
    />
  );
};
