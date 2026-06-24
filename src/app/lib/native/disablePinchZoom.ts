// iOS WKWebView는 viewport의 user-scalable=no / maximum-scale를 접근성 이유로 무시한다.
// 그래서 WebKit 제스처 이벤트를 직접 막아 핀치 줌을, touch-action으로 더블탭 줌을 차단한다.
// 단 data-allow-zoom이 붙은 영역(지도 등)에서는 자체 줌을 위해 막지 않는다.
export const disablePinchZoom = (): void => {
  const preventGesture = (event: Event) => {
    const target = event.target;
    if (target instanceof Element && target.closest('[data-allow-zoom]')) return;
    event.preventDefault();
  };
  document.addEventListener('gesturestart', preventGesture);
  document.addEventListener('gesturechange', preventGesture);
  document.addEventListener('gestureend', preventGesture);

  // 더블탭 확대 차단 (스크롤·핀치 외 제스처만 비활성화 → 스크롤은 그대로)
  document.documentElement.style.touchAction = 'manipulation';
};
