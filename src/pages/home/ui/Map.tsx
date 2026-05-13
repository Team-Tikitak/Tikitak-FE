import { useRef } from 'react';
import { createPortal } from 'react-dom';
import { MapImage } from './MapImage';
import { useKakaoMap } from '../hooks/useKakaoMap';
import { type Pin } from '../model/types';

interface MapProps {
  pins: Pin[];
  initialCenter: { latitude: number; longitude: number };
  onPinClick?: () => void;
}

export const Map = ({ pins, initialCenter, onPinClick }: MapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const { overlayEntries, sdkError } = useKakaoMap(mapRef, pins, initialCenter);

  if (sdkError) {
    return (
      <div className="pointer-events-auto absolute inset-0 -z-10 flex items-center justify-center bg-gray-100">
        <p className="text-sm text-gray-500">지도를 불러올 수 없습니다</p>
      </div>
    );
  }

  return (
    <div ref={mapRef} className="pointer-events-auto absolute inset-0 -z-10">
      {overlayEntries.map(({ container, pin }) =>
        createPortal(
          <MapImage src={pin.thumbnailImageUrl} count={pin.feedCount} onClick={onPinClick} />,
          container,
          `${pin.latitude}-${pin.longitude}`,
        ),
      )}
    </div>
  );
};
