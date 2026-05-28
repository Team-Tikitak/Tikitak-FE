import { useRef } from 'react';
import type { Pin } from '@/shared/api/map/types';
import { normalizeImageUrl } from '@/shared/lib';
import { MapImage } from './MapImage';
import { useKakaoMap } from '../hooks/useKakaoMap';

interface MapProps {
  pins: Pin[];
  initialCenter: { latitude: number; longitude: number };
  onPinClick?: (pin: Pin) => void;
}

const PIN_SIZE = 87;

export const Map = ({ pins, initialCenter, onPinClick }: MapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const { pinPositions, sdkError } = useKakaoMap(mapRef, pins, initialCenter);

  if (sdkError) {
    return (
      <div className="pointer-events-auto absolute inset-0 z-0 flex items-center justify-center bg-gray-100">
        <p className="text-sm text-gray-500">지도를 불러올 수 없습니다</p>
      </div>
    );
  }

  const pinByPlaceId = new globalThis.Map(pins.map((pin) => [pin.placeId, pin] as const));

  return (
    <>
      <div ref={mapRef} className="pointer-events-auto absolute inset-0 z-0" />
      <div className="pointer-events-none absolute inset-0 z-0">
        {pinPositions.map(({ placeId, x, y }) => {
          const pin = pinByPlaceId.get(placeId);
          if (!pin) return null;
          return (
            <div
              key={placeId}
              data-hero-key={`pin-${placeId}`}
              className="pointer-events-auto absolute"
              style={{
                left: x - PIN_SIZE / 2,
                top: y - PIN_SIZE,
                width: PIN_SIZE,
                height: PIN_SIZE,
              }}
            >
              <MapImage
                src={normalizeImageUrl(pin.thumbnailUrl, 'feed-image')}
                count={pin.feedCount}
                onClick={() => onPinClick?.(pin)}
              />
            </div>
          );
        })}
      </div>
    </>
  );
};
