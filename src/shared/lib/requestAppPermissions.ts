import { Capacitor } from '@capacitor/core';

const requestNativePermissions = async () => {
  const [{ Camera }, { Geolocation }] = await Promise.all([
    import('@capacitor/camera'),
    import('@capacitor/geolocation'),
  ]);
  // iOS는 권한 다이얼로그를 동시에 못 띄워 순차 요청
  await Camera.requestPermissions({ permissions: ['camera', 'photos'] }).catch(() => undefined);
  await Geolocation.requestPermissions().catch(() => undefined);
};

// 네이티브만 약관 동의 직후 위치·카메라·사진 미리 요청 (웹은 기능 사용 시점)
export const requestAppPermissions = async () => {
  if (!Capacitor.isNativePlatform()) return;
  await requestNativePermissions().catch(() => undefined);
};
