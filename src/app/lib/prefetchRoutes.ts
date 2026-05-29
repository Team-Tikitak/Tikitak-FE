type RequestIdleCallback = (
  cb: (deadline: { didTimeout: boolean; timeRemaining: () => number }) => void,
  opts?: { timeout: number },
) => number;

const idleQueue = (cb: () => void) => {
  if (typeof window === 'undefined') return;
  const ric = (window as unknown as { requestIdleCallback?: RequestIdleCallback })
    .requestIdleCallback;
  if (ric) {
    ric(() => cb(), { timeout: 2000 });
  } else {
    window.setTimeout(cb, 1500);
  }
};

export const prefetchTabRoutes = (): void => {
  idleQueue(() => {
    void import('@/pages/home/ui');
    void import('@/pages/feed/ui');
    void import('@/pages/activity/ui/ActivityPage');
    void import('@/pages/myPage/ui');
  });
};
