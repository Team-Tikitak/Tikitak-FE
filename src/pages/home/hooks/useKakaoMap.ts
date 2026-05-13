import { useEffect, useRef, useState, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { type Pin } from '../model/types';
import { MapImage } from '../ui/MapImage';

type WithSetMap = { setMap: (m: unknown) => void };
type OverlayEntry = { overlay: WithSetMap; root: ReturnType<typeof createRoot> };

// React 렌더 사이클과 겹치지 않도록 unmount 조정
const deferUnmount = (root: ReturnType<typeof createRoot>) => {
  setTimeout(() => root.unmount(), 0);
};

function createOverlay(position: unknown, src: string, count?: number, onClick?: () => void) {
  const container = document.createElement('div');

  const root = createRoot(container);
  root.render(createElement(MapImage, { src, count, onClick }));

  const overlay = new window.kakao.maps.CustomOverlay({ position, content: container, yAnchor: 1 });

  return { overlay: overlay as WithSetMap, root };
}

export const useKakaoMap = (
  mapRef: React.RefObject<HTMLDivElement | null>,
  pins: Pin[],
  initialCenter: { latitude: number; longitude: number },
  onPinClick?: () => void,
) => {
  const mapInstanceRef = useRef<unknown>(null);
  const initialCenterRef = useRef(initialCenter);
  const overlaysRef = useRef<OverlayEntry[]>([]);
  const [mapReady, setMapReady] = useState(false);

  // 지도 초기화
  useEffect(() => {
    if (mapInstanceRef.current || !mapRef.current) return;

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

      overlaysRef.current.forEach(({ overlay, root }) => {
        overlay.setMap(null);
        deferUnmount(root);
      });
      overlaysRef.current = [];
    };
  }, [mapRef]);

  // 핀 렌더링 — 지도 준비 완료 or pins/onPinClick 변경 시 실행
  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current) return;

    overlaysRef.current.forEach(({ overlay, root }) => {
      overlay.setMap(null);
      deferUnmount(root);
    });
    overlaysRef.current = [];

    pins.forEach(({ latitude, longitude, feedCount, thumbnailImageUrl }) => {
      const position = new window.kakao.maps.LatLng(latitude, longitude);
      const entry = createOverlay(position, thumbnailImageUrl, feedCount, onPinClick);
      entry.overlay.setMap(mapInstanceRef.current);
      overlaysRef.current.push(entry);
    });
  }, [mapReady, pins, onPinClick]);
};
