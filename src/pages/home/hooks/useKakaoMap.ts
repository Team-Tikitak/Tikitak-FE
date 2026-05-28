import { useEffect, useRef, useState } from 'react';
import type { Pin } from '@/shared/api/map/types';
import { ensureKakaoSdk } from '@/shared/lib/kakaoSdk';
import { readStoredHeroPin } from '../lib/heroPinStorage';

export type PinScreenPosition = { placeId: string; x: number; y: number };
export type MapViewport = { latitude: number; longitude: number; level: number };

const positionCache = new globalThis.Map<string, { x: number; y: number }>();
let lastViewport: MapViewport | null = null;

const restoreCachedPositions = (pins: Pin[]): PinScreenPosition[] => {
  const storedHeroPin = readStoredHeroPin();

  return pins
    .map((pin) => {
      const shouldUseCenteredHeroFallback =
        pin.placeId === storedHeroPin?.placeId &&
        typeof storedHeroPin.latitude === 'number' &&
        typeof storedHeroPin.longitude === 'number';

      if (shouldUseCenteredHeroFallback) return null;

      const cached = positionCache.get(pin.placeId);
      return cached ? { placeId: pin.placeId, x: cached.x, y: cached.y } : null;
    })
    .filter((entry): entry is PinScreenPosition => entry !== null);
};

export const useKakaoMap = (
  mapRef: React.RefObject<HTMLDivElement | null>,
  pins: Pin[],
  initialCenter: { latitude: number; longitude: number },
) => {
  const mapInstanceRef = useRef<KakaoMap | null>(null);
  const initialCenterRef = useRef(initialCenter);
  const hasUserDraggedMapRef = useRef(false);
  const shouldSyncInitialCenterRef = useRef(true);
  const [pinPositions, setPinPositions] = useState<PinScreenPosition[]>(() =>
    restoreCachedPositions(pins),
  );
  const [mapReady, setMapReady] = useState(false);
  const [sdkError, setSdkError] = useState(false);

  useEffect(() => {
    if (mapInstanceRef.current || !mapRef.current) return;

    let cancelled = false;

    ensureKakaoSdk()
      .then(() => {
        const kakaoMaps = window.kakao?.maps;
        if (cancelled || mapInstanceRef.current || !mapRef.current || !kakaoMaps) return;

        const storedHeroPin = readStoredHeroPin();
        const storedPinCenter =
          typeof storedHeroPin?.latitude === 'number' && typeof storedHeroPin.longitude === 'number'
            ? {
                latitude: storedHeroPin.latitude,
                longitude: storedHeroPin.longitude,
                level: storedHeroPin.level ?? lastViewport?.level ?? 3,
              }
            : null;
        const startCenter = storedPinCenter ??
          lastViewport ?? {
            latitude: initialCenterRef.current.latitude,
            longitude: initialCenterRef.current.longitude,
            level: 3,
          };
        shouldSyncInitialCenterRef.current = !storedPinCenter && !lastViewport;

        const map = new kakaoMaps.Map(mapRef.current, {
          center: new kakaoMaps.LatLng(startCenter.latitude, startCenter.longitude),
          level: startCenter.level,
        });

        mapInstanceRef.current = map;
        setMapReady(true);
      })
      .catch(() => {
        if (!cancelled) setSdkError(true);
      });

    return () => {
      cancelled = true;
    };
  }, [mapRef]);

  useEffect(() => {
    const kakaoMaps = window.kakao?.maps;
    const map = mapInstanceRef.current;
    if (!mapReady || !map || !kakaoMaps) return;

    let rafId: number | null = null;

    const getCurrentViewport = (): MapViewport => {
      const center = map.getCenter();
      return {
        latitude: center.getLat(),
        longitude: center.getLng(),
        level: map.getLevel(),
      };
    };

    const updatePositions = () => {
      const proj = map.getProjection();
      const positions = pins.map((pin) => {
        const latLng = new kakaoMaps.LatLng(pin.latitude, pin.longitude);
        const point = proj.containerPointFromCoords(latLng);
        positionCache.set(pin.placeId, { x: point.x, y: point.y });
        return { placeId: pin.placeId, x: point.x, y: point.y };
      });
      setPinPositions(positions);
      lastViewport = getCurrentViewport();
    };

    const updatePositionsOnInteraction = () => {
      hasUserDraggedMapRef.current = true;
      if (rafId !== null) return;
      rafId = requestAnimationFrame(() => {
        updatePositions();
        rafId = null;
      });
    };

    updatePositions();
    kakaoMaps.event.addListener(map, 'drag', updatePositionsOnInteraction);
    kakaoMaps.event.addListener(map, 'zoom_changed', updatePositionsOnInteraction);
    kakaoMaps.event.addListener(map, 'idle', updatePositions);

    return () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
      kakaoMaps.event.removeListener(map, 'drag', updatePositionsOnInteraction);
      kakaoMaps.event.removeListener(map, 'zoom_changed', updatePositionsOnInteraction);
      kakaoMaps.event.removeListener(map, 'idle', updatePositions);
    };
  }, [mapReady, pins]);

  useEffect(() => {
    const kakaoMaps = window.kakao?.maps;
    const map = mapInstanceRef.current;
    if (
      !mapReady ||
      !map ||
      !kakaoMaps ||
      hasUserDraggedMapRef.current ||
      !shouldSyncInitialCenterRef.current
    ) {
      return;
    }

    map.setCenter(new kakaoMaps.LatLng(initialCenter.latitude, initialCenter.longitude));
  }, [mapReady, initialCenter.latitude, initialCenter.longitude]);

  const getCurrentViewport = (): MapViewport | undefined => {
    const map = mapInstanceRef.current;
    if (!map) return undefined;

    const center = map.getCenter();
    return {
      latitude: center.getLat(),
      longitude: center.getLng(),
      level: map.getLevel(),
    };
  };

  return { pinPositions, sdkError, getCurrentViewport };
};
