// 앱 미설치 상태로 일반 브라우저에서 열렸을 때(Capacitor 네이티브 셸 밖) OS를 구분하기 위한 유틸.
// Capacitor.getPlatform()은 이 경우 항상 'web'을 반환해서 쓸 수 없다.
export const isAndroidBrowser = (): boolean =>
  typeof navigator !== 'undefined' && /android/i.test(navigator.userAgent);
