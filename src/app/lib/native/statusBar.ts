const SYSTEM_BAR_BACKGROUND = '#ffffff';

export const setupAndroidStatusBar = async (): Promise<void> => {
  document.documentElement.classList.add('cap-android');

  const [{ StatusBar, Style }, { SystemBars, SystemBarsStyle }] = await Promise.all([
    import('@capacitor/status-bar'),
    import('@capacitor/core'),
  ]);

  await Promise.allSettled([
    StatusBar.show(),
    StatusBar.setOverlaysWebView({ overlay: true }),
    StatusBar.setBackgroundColor({ color: SYSTEM_BAR_BACKGROUND }),
    StatusBar.setStyle({ style: Style.Light }),
    SystemBars.show(),
    SystemBars.setStyle({ style: SystemBarsStyle.Light }),
  ]);

  const statusBarInfo = await StatusBar.getInfo().catch(() => null);
  if (statusBarInfo?.height) {
    document.documentElement.style.setProperty('--status-bar-height', `${statusBarInfo.height}px`);
  }
};
