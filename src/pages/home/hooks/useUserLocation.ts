import { useEffect, useState } from 'react';

type LatLng = { latitude: number; longitude: number };

const DEFAULT_CENTER: LatLng = { latitude: 37.5507563, longitude: 126.9254901 };
const GEOLOCATION_TIMEOUT = 5000;

export const useUserLocation = () => {
  const [center, setCenter] = useState<LatLng>(DEFAULT_CENTER);

  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => setCenter({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
      () => setCenter(DEFAULT_CENTER),
      { timeout: GEOLOCATION_TIMEOUT },
    );
  }, []);

  return { center };
};
