import { Capacitor } from '@capacitor/core';

export type AppPermission = 'location' | 'camera' | 'photos' | 'notifications';

const isGranted = (state: string | undefined) => state === 'granted' || state === 'limited';
const isBlocked = (state: string | undefined) => state === 'denied' || state === 'restricted';

export const requestAppPermission = async (permission: AppPermission) => {
  if (!Capacitor.isNativePlatform()) return false;

  if (permission === 'location') {
    const { Geolocation } = await import('@capacitor/geolocation');
    const status = await Geolocation.requestPermissions().catch(() => null);

    return status?.location === 'granted' || status?.coarseLocation === 'granted';
  }

  if (permission === 'notifications') {
    const { FirebaseMessaging } = await import('@capacitor-firebase/messaging');
    const status = await FirebaseMessaging.requestPermissions().catch(() => null);
    return status?.receive === 'granted';
  }

  const { Camera } = await import('@capacitor/camera');
  const currentStatus = await Camera.checkPermissions().catch(() => null);
  const currentPermissionState = currentStatus?.[permission];
  if (isGranted(currentPermissionState)) return true;
  if (isBlocked(currentPermissionState)) return false;

  const status = await Camera.requestPermissions({ permissions: [permission] }).catch(() => null);
  return isGranted(status?.[permission]);
};
