const DIM_COLOR = '#808080'; // bg-black/50 over #ffffff
const DEFAULT_COLOR = '#ffffff';

let openCount = 0;

// 웹/PWA 전용: theme-color로 브라우저 UI 영역 dim.
// 네이티브는 overlaysWebView=true(edge-to-edge)라 바텀시트 오버레이가 상태바까지 같은 레이어로 덮어 동기화됨(여기서 안 건드림).
const applyThemeColor = (color: string) => {
  if (typeof document === 'undefined') return;
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', color);
};

export const pushStatusBarDim = (): void => {
  openCount += 1;
  if (openCount === 1) applyThemeColor(DIM_COLOR);
};

export const popStatusBarDim = (): void => {
  openCount = Math.max(0, openCount - 1);
  if (openCount === 0) applyThemeColor(DEFAULT_COLOR);
};
