import { useEffect, useState } from 'react';

type LatLng = { latitude: number; longitude: number };

const DEFAULT_CENTER: LatLng = { latitude: 37.5507563, longitude: 126.9254901 };
const GEOLOCATION_TIMEOUT = 5000;

export const useUserLocation = () => {
  const [center, setCenter] = useState<LatLng>(DEFAULT_CENTER);
  // geolocation 미지원이면 즉시 확정(기본 좌표)
  const [located, setLocated] = useState(
    () => typeof navigator === 'undefined' || !navigator.geolocation,
  );

  useEffect(() => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCenter({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
        setLocated(true);
      },
      () => setLocated(true),
      { timeout: GEOLOCATION_TIMEOUT },
    );
  }, []);

  return { center, located };
};
