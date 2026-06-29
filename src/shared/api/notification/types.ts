export type DevicePlatform = 'IOS' | 'ANDROID';

export interface RegisterDeviceTokenRequest {
  fcmToken: string;
  platform: DevicePlatform;
}

export interface DeleteDeviceTokenRequest {
  fcmToken: string;
}
