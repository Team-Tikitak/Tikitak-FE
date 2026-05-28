import { useRef, useState } from 'react';
import type { Pin } from '@/shared/api/map/types';
import { normalizeImageUrl } from '@/shared/lib';
import { MapImage } from './MapImage';
import { useKakaoMap } from '../hooks/useKakaoMap';
import { readStoredHeroPin, storeHeroPin } from '../lib/heroPinStorage';

interface MapProps {
  pins: Pin[];
  initialCenter: { latitude: number; longitude: number };
  onPinClick?: (pin: Pin) => void;
}

const PIN_SIZE = 87;

export const Map = ({ pins, initialCenter, onPinClick }: MapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [storedHeroPin] = useState(readStoredHeroPin);
  const { pinPositions, sdkError, getCurrentViewport } = useKakaoMap(mapRef, pins, initialCenter);

  if (sdkError) {
    return (
      <div className="pointer-events-auto absolute inset-0 z-0 flex items-center justify-center bg-gray-100">
        <p className="text-sm text-gray-500">지도를 불러올 수 없습니다</p>
      </div>
    );
  }

  const pinByPlaceId = new globalThis.Map(pins.map((pin) => [pin.placeId, pin] as const));
  const shouldRenderStoredHeroPin =
    storedHeroPin && !pinPositions.some((position) => position.placeId === storedHeroPin.placeId);
  const shouldCenterStoredHeroPin =
    typeof storedHeroPin?.latitude === 'number' && typeof storedHeroPin.longitude === 'number';

  return (
    <>
      <div ref={mapRef} className="pointer-events-auto absolute inset-0 z-0" />
      <div className="pointer-events-none absolute inset-0 z-0">
        {shouldRenderStoredHeroPin && (
          <MapImage
            data-hero-exit-key={`pin-${storedHeroPin.placeId}`}
            src={storedHeroPin.thumbnailUrl}
            count={storedHeroPin.feedCount}
            className="pointer-events-none"
            style={{
              left: shouldCenterStoredHeroPin
                ? `calc(50% - ${PIN_SIZE / 2}px)`
                : storedHeroPin.x - PIN_SIZE / 2,
              top: shouldCenterStoredHeroPin
                ? `calc(50% - ${PIN_SIZE}px)`
                : storedHeroPin.y - PIN_SIZE,
              width: PIN_SIZE,
              height: PIN_SIZE,
            }}
          />
        )}
        {pinPositions.map(({ placeId, x, y }) => {
          const pin = pinByPlaceId.get(placeId);
          if (!pin) return null;
          return (
            <MapImage
              key={placeId}
              data-hero-exit-key={`pin-${placeId}`}
              src={normalizeImageUrl(pin.thumbnailUrl, 'feed-image')}
              count={pin.feedCount}
              className="pointer-events-auto"
              style={{
                left: x - PIN_SIZE / 2,
                top: y - PIN_SIZE,
                width: PIN_SIZE,
                height: PIN_SIZE,
              }}
              onClick={() => {
                storeHeroPin(pin, { x, y }, getCurrentViewport());
                onPinClick?.(pin);
              }}
            />
          );
        })}
      </div>
    </>
  );
};
