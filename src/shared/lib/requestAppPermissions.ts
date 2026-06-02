import { Capacitor } from '@capacitor/core';

const requestNativePermissions = async () => {
  const [{ Camera }, { Geolocation }] = await Promise.all([
    import('@capacitor/camera'),
    import('@capacitor/geolocation'),
  ]);
  await Promise.allSettled([
    Camera.requestPermissions({ permissions: ['camera', 'photos'] }),
    Geolocation.requestPermissions(),
  ]);
};

// 네이티브 앱만 약관 동의 직후 위치·카메라·사진을 미리 요청(접근 권한 안내 화면 표준 패턴).
// 웹/PWA는 사전 요청이 어색·불가하므로 각 기능 사용 시점에 요청(위치=지도, 카메라=실행).
// 거부돼도 흐름은 막지 않음 — 기능 사용 시점에 재요청된다.
export const requestAppPermissions = async () => {
  if (!Capacitor.isNativePlatform()) return;
  try {
    await requestNativePermissions();
  } catch {
    // 권한 요청 실패는 무시
  }
};
