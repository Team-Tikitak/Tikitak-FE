import { useEffect, useRef, useState } from 'react';
import { type Pin } from '../model/types';

type WithSetMap = { setMap: (m: unknown) => void };

export type OverlayEntry = { container: HTMLDivElement; pin: Pin };

export const useKakaoMap = (
  mapRef: React.RefObject<HTMLDivElement | null>,
  pins: Pin[],
  initialCenter: { latitude: number; longitude: number },
) => {
  const mapInstanceRef = useRef<unknown>(null);
  const initialCenterRef = useRef(initialCenter);
  const kakaoOverlaysRef = useRef<WithSetMap[]>([]);
  const [overlayEntries, setOverlayEntries] = useState<OverlayEntry[]>([]);
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
      kakaoOverlaysRef.current.forEach((o) => o.setMap(null));
      kakaoOverlaysRef.current = [];
      setOverlayEntries([]);
    };
  }, [mapRef, sdkError]);

  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current) return;

    kakaoOverlaysRef.current.forEach((o) => o.setMap(null));
    kakaoOverlaysRef.current = [];

    const entries: OverlayEntry[] = pins.map((pin) => {
      const container = document.createElement('div');
      const position = new window.kakao.maps.LatLng(pin.latitude, pin.longitude);

      const overlay = new window.kakao.maps.CustomOverlay({
        position,
        content: container,
        yAnchor: 1,
      });
      (overlay as WithSetMap).setMap(mapInstanceRef.current);

      kakaoOverlaysRef.current.push(overlay as WithSetMap);

      return { container, pin };
    });

    setOverlayEntries(entries);
  }, [mapReady, pins]);

  return { overlayEntries, sdkError };
};
