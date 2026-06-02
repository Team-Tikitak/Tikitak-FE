import { Capacitor } from '@capacitor/core';
import { useEffect, useState } from 'react';

type LatLng = { latitude: number; longitude: number };

const DEFAULT_CENTER: LatLng = { latitude: 37.5507563, longitude: 126.9254901 };
const GEOLOCATION_TIMEOUT = 5000;

export const useUserLocation = () => {
  const [center, setCenter] = useState<LatLng>(DEFAULT_CENTER);
  const [located, setLocated] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const settle = (coords?: LatLng) => {
      if (cancelled) return;
      if (coords) setCenter(coords);
      setLocated(true);
    };

    const locate = async () => {
      // 네이티브 WKWebView는 navigator.geolocation 미동작 → @capacitor/geolocation 사용
      if (Capacitor.isNativePlatform()) {
        try {
          const { Geolocation } = await import('@capacitor/geolocation');
          const pos = await Geolocation.getCurrentPosition({ timeout: GEOLOCATION_TIMEOUT });
          settle({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
        } catch {
          settle();
        }
        return;
      }

      if (typeof navigator === 'undefined' || !navigator.geolocation) {
        settle();
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => settle({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
        () => settle(),
        { timeout: GEOLOCATION_TIMEOUT },
      );
    };

    void locate();

    return () => {
      cancelled = true;
    };
  }, []);

  return { center, located };
};
