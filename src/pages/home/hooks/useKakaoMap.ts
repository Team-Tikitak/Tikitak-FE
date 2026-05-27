import { useEffect, useRef, useState } from 'react';
import type { Pin } from '@/shared/api/map/types';

type KakaoProjection = {
  containerPointFromCoords: (latLng: unknown) => { x: number; y: number };
};
type KakaoMap = {
  getProjection: () => KakaoProjection;
};

export type PinScreenPosition = { placeId: string; x: number; y: number };

const positionCache = new globalThis.Map<string, { x: number; y: number }>();

const restoreCachedPositions = (pins: Pin[]): PinScreenPosition[] =>
  pins
    .map((pin) => {
      const cached = positionCache.get(pin.placeId);
      return cached ? { placeId: pin.placeId, x: cached.x, y: cached.y } : null;
    })
    .filter((entry): entry is PinScreenPosition => entry !== null);

export const useKakaoMap = (
  mapRef: React.RefObject<HTMLDivElement | null>,
  pins: Pin[],
  initialCenter: { latitude: number; longitude: number },
) => {
  const mapInstanceRef = useRef<unknown>(null);
  const initialCenterRef = useRef(initialCenter);
  const [pinPositions, setPinPositions] = useState<PinScreenPosition[]>(() =>
    restoreCachedPositions(pins),
  );
  const [mapReady, setMapReady] = useState(false);
  const [sdkError] = useState(() => !window.kakao?.maps);

  useEffect(() => {
    if (sdkError || mapInstanceRef.current || !mapRef.current) return;

    let cancelled = false;

    window.kakao.maps.load(() => {
      if (cancelled || mapInstanceRef.current || !mapRef.current) return;

      const map = new window.kakao.maps.Map(mapRef.current, {
        center: new window.kakao.maps.LatLng(
          initialCenterRef.current.latitude,
          initialCenterRef.current.longitude,
        ),
        level: 3,
      });

      mapInstanceRef.current = map;
      setMapReady(true);
    });

    return () => {
      cancelled = true;
    };
  }, [mapRef, sdkError]);

  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current) return;
    const map = mapInstanceRef.current as KakaoMap;

    let rafId: number | null = null;

    const updatePositions = () => {
      const proj = map.getProjection();
      const positions = pins.map((pin) => {
        const latLng = new window.kakao.maps.LatLng(pin.latitude, pin.longitude);
        const point = proj.containerPointFromCoords(latLng);
        positionCache.set(pin.placeId, { x: point.x, y: point.y });
        return { placeId: pin.placeId, x: point.x, y: point.y };
      });
      setPinPositions(positions);
    };

    const updatePositionsOnDrag = () => {
      if (rafId !== null) return;
      rafId = requestAnimationFrame(() => {
        updatePositions();
        rafId = null;
      });
    };

    updatePositions();
    window.kakao.maps.event.addListener(map, 'drag', updatePositionsOnDrag);
    window.kakao.maps.event.addListener(map, 'idle', updatePositions);

    return () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
      window.kakao.maps.event.removeListener(map, 'drag', updatePositionsOnDrag);
      window.kakao.maps.event.removeListener(map, 'idle', updatePositions);
    };
  }, [mapReady, pins]);

  return { pinPositions, sdkError };
};
