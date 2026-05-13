import { useRef } from 'react';
import { useKakaoMap } from '../hooks/useKakaoMap';
import { type Pin } from '../model/types';

interface MapProps {
  pins: Pin[];
  initialCenter: { latitude: number; longitude: number };
  onPinClick?: () => void;
}

export const Map = ({ pins, initialCenter, onPinClick }: MapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  useKakaoMap(mapRef, pins, initialCenter, onPinClick);

  return <div ref={mapRef} className="pointer-events-auto absolute inset-0 -z-10" />;
};
