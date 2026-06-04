import { useEffect, useMemo, useRef, useState } from 'react';
import type { Pin } from '@/shared/api/map/types';
import { normalizeImageUrl } from '@/shared/lib';
import { LoadingState } from '@/shared/ui';
import { MapImage } from './MapImage';
import { StoredHeroPin } from './StoredHeroPin';
import { useKakaoMap } from '../hooks/useKakaoMap';
import { clearStoredHeroPin, readStoredHeroPin, storeHeroPin } from '../lib/heroPinStorage';

interface MapProps {
  pins: Pin[];
  teamId: number;
  initialCenter: { latitude: number; longitude: number };
  locationResolved: boolean;
  onPinClick?: (pin: Pin) => void;
}

const PIN_SIZE = 87;
const PIN_ENTER_MAX_LEVEL = 6;

export const Map = ({ pins, teamId, initialCenter, locationResolved, onPinClick }: MapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [storedHeroPin, setStoredHeroPin] = useState(readStoredHeroPin);
  const { renderItems, sdkError, mapReady, getCurrentViewport, expandCluster, focusPin } =
    useKakaoMap(mapRef, pins, initialCenter, locationResolved);

  // hero 전환에 쓰인 뒤(지도 실렌더 후) 저장된 hero 핀 정리 — 클러스터/뷰 밖에서 잔상으로 남지 않게
  useEffect(() => {
    if (!storedHeroPin || renderItems.length === 0) return;
    const id = window.setTimeout(() => {
      clearStoredHeroPin();
      setStoredHeroPin(null);
    }, 500);
    return () => window.clearTimeout(id);
  }, [storedHeroPin, renderItems.length]);

  const pinByPlaceId = useMemo(
    () => new globalThis.Map(pins.map((pin) => [pin.placeId, pin] as const)),
    [pins],
  );

  if (sdkError) {
    return (
      <div className="pointer-events-auto absolute inset-0 z-0 flex items-center justify-center bg-gray-100">
        <p className="text-sm text-gray-500">지도를 불러올 수 없습니다</p>
      </div>
    );
  }

  const shouldRenderStoredHeroPin =
    storedHeroPin &&
    storedHeroPin.teamId === teamId &&
    !renderItems.some((item) => item.type === 'pin' && item.placeId === storedHeroPin.placeId);

  return (
    <>
      <div ref={mapRef} className="pointer-events-auto absolute inset-0 z-0" />
      {!mapReady && (
        <div className="pointer-events-none absolute inset-0 z-1 flex items-center justify-center bg-white pb-[calc(60px+env(safe-area-inset-bottom))]">
          <LoadingState variant="fullscreen" />
        </div>
      )}
      <div className="pointer-events-none absolute inset-0 z-0">
        {shouldRenderStoredHeroPin && (
          <StoredHeroPin storedHeroPin={storedHeroPin} pinSize={PIN_SIZE} />
        )}
        {renderItems.map((item) => {
          const style = {
            left: item.x - PIN_SIZE / 2,
            top: item.y - PIN_SIZE,
            width: PIN_SIZE,
            height: PIN_SIZE,
          };

          if (item.type === 'cluster') {
            return (
              <MapImage
                key={`cluster-${item.clusterId}`}
                src={normalizeImageUrl(item.thumbnailUrl)}
                count={item.count}
                className="pointer-events-auto"
                style={style}
                onClick={() => expandCluster(item.clusterId, item.longitude, item.latitude)}
              />
            );
          }

          const pin = pinByPlaceId.get(item.placeId);
          if (!pin) return null;
          return (
            <MapImage
              key={item.placeId}
              data-hero-exit-key={`pin-${item.placeId}`}
              src={normalizeImageUrl(pin.thumbnailUrl)}
              count={pin.feedCount}
              className="pointer-events-auto"
              style={style}
              onClick={() => {
                const viewport = getCurrentViewport();
                if (viewport && viewport.level > PIN_ENTER_MAX_LEVEL) {
                  focusPin(pin.longitude, pin.latitude, PIN_ENTER_MAX_LEVEL);
                  return;
                }
                storeHeroPin(pin, { x: item.x, y: item.y }, teamId, viewport);
                onPinClick?.(pin);
              }}
            />
          );
        })}
      </div>
    </>
  );
};
