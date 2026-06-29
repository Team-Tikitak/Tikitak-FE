import { Capacitor } from '@capacitor/core';
import type { DevicePlatform } from '@/shared/api/notification/types';
import { clearStoredDeviceToken } from '@/shared/lib/native/deviceTokenStorage';
import type { FirebaseMessagingPlugin } from '@capacitor-firebase/messaging';

export interface DeviceToken {
  fcmToken: string;
  platform: DevicePlatform;
}

export type DeviceTokenResult =
  | { status: 'granted'; token: DeviceToken }
  | { status: 'just-denied' }
  | { status: 'already-denied' }
  | { status: 'unavailable' };

type NotificationPermissionState = 'granted' | 'just-denied' | 'already-denied';

export const resolvePlatform = (): DevicePlatform | null => {
  switch (Capacitor.getPlatform()) {
    case 'ios':
      return 'IOS';
    case 'android':
      return 'ANDROID';
    default:
      return null;
  }
};

const ensureNotificationPermission = async (
  messaging: FirebaseMessagingPlugin,
): Promise<NotificationPermissionState> => {
  const { receive } = await messaging.checkPermissions();
  if (receive === 'granted') return 'granted';
  if (receive === 'denied') return 'already-denied';

  const requested = await messaging.requestPermissions();
  return requested.receive === 'granted' ? 'granted' : 'just-denied';
};

const fetchToken = async (
  messaging: FirebaseMessagingPlugin,
  platform: DevicePlatform,
): Promise<DeviceToken | null> => {
  const { token } = await messaging.getToken();
  if (!token) return null;
  return { fcmToken: token, platform };
};

export const getDeviceToken = async (): Promise<DeviceTokenResult> => {
  const platform = resolvePlatform();
  if (!platform) return { status: 'unavailable' };

  try {
    const { FirebaseMessaging } = await import('@capacitor-firebase/messaging');

    const permission = await ensureNotificationPermission(FirebaseMessaging);
    if (permission !== 'granted') return { status: permission };

    const token = await fetchToken(FirebaseMessaging, platform);
    return token ? { status: 'granted', token } : { status: 'unavailable' };
  } catch {
    return { status: 'unavailable' };
  }
};

export const invalidateDeviceToken = async (): Promise<void> => {
  if (!Capacitor.isNativePlatform()) return;
  try {
    const { FirebaseMessaging } = await import('@capacitor-firebase/messaging');
    await FirebaseMessaging.deleteToken();
    await clearStoredDeviceToken();
  } catch {
    // 폐기 실패는 무시
  }
};

export const getDeviceTokenIfGranted = async (): Promise<DeviceToken | null> => {
  const platform = resolvePlatform();
  if (!platform) return null;

  try {
    const { FirebaseMessaging } = await import('@capacitor-firebase/messaging');

    const { receive } = await FirebaseMessaging.checkPermissions();
    if (receive !== 'granted') return null;

    return await fetchToken(FirebaseMessaging, platform);
  } catch {
    return null;
  }
};
