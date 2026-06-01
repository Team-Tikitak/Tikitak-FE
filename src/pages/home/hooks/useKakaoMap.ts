import { useEffect, useMemo, useRef, useState } from 'react';
import type { Pin } from '@/shared/api/map/types';
import { ensureKakaoSdk } from '@/shared/lib/kakaoSdk';
import {
  createPinClusterIndex,
  kakaoLevelToZoom,
  zoomToKakaoLevel,
  type PinClusterIndex,
} from '../lib/clusterIndex';
import { readStoredHeroPin } from '../lib/heroPinStorage';

export type MapViewport = { latitude: number; longitude: number; level: number };

export type MapRenderItem =
  | { type: 'pin'; placeId: string; x: number; y: number }
  | {
      type: 'cluster';
      clusterId: number;
      count: number;
      thumbnailUrl: string;
      latitude: number;
      longitude: number;
      x: number;
      y: number;
    };

const positionCache = new globalThis.Map<string, { x: number; y: number }>();
let lastViewport: MapViewport | null = null;

const restoreCachedItems = (pins: Pin[]): MapRenderItem[] => {
  const storedHeroPin = readStoredHeroPin();

  return pins
    .map((pin): MapRenderItem | null => {
      const shouldUseCenteredHeroFallback =
        pin.placeId === storedHeroPin?.placeId &&
        typeof storedHeroPin.latitude === 'number' &&
        typeof storedHeroPin.longitude === 'number';

      if (shouldUseCenteredHeroFallback) return null;

      const cached = positionCache.get(pin.placeId);
      return cached ? { type: 'pin', placeId: pin.placeId, x: cached.x, y: cached.y } : null;
    })
    .filter((entry): entry is MapRenderItem => entry !== null);
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
  const [renderItems, setRenderItems] = useState<MapRenderItem[]>(() => restoreCachedItems(pins));
  const [mapReady, setMapReady] = useState(false);
  const [sdkError, setSdkError] = useState(false);

  const index = useMemo<PinClusterIndex>(() => createPinClusterIndex(pins), [pins]);

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
      const bounds = map.getBounds();
      const sw = bounds.getSouthWest();
      const ne = bounds.getNorthEast();
      const bbox: [number, number, number, number] = [
        sw.getLng(),
        sw.getLat(),
        ne.getLng(),
        ne.getLat(),
      ];
      const zoom = kakaoLevelToZoom(map.getLevel());

      const items = index.getClusters(bbox, zoom).map((feature): MapRenderItem => {
        const [longitude, latitude] = feature.geometry.coordinates;
        const point = proj.containerPointFromCoords(new kakaoMaps.LatLng(latitude, longitude));
        const properties = feature.properties;

        if ('cluster' in properties) {
          return {
            type: 'cluster',
            clusterId: properties.cluster_id,
            count: properties.point_count,
            thumbnailUrl: properties.representativeThumbnailUrl,
            latitude,
            longitude,
            x: point.x,
            y: point.y,
          };
        }

        positionCache.set(properties.placeId, { x: point.x, y: point.y });
        return { type: 'pin', placeId: properties.placeId, x: point.x, y: point.y };
      });

      setRenderItems(items);
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
  }, [mapReady, pins, index]);

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

  const expandCluster = (clusterId: number, longitude: number, latitude: number) => {
    const map = mapInstanceRef.current;
    const kakaoMaps = window.kakao?.maps;
    if (!map || !kakaoMaps) return;

    hasUserDraggedMapRef.current = true;
    const expansionZoom = index.getClusterExpansionZoom(clusterId);
    const target = new kakaoMaps.LatLng(latitude, longitude);
    map.setLevel(zoomToKakaoLevel(expansionZoom), { anchor: target });
    map.panTo(target);
  };

  return { renderItems, sdkError, getCurrentViewport, expandCluster };
};
