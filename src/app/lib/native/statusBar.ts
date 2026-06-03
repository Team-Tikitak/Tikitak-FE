export const setupAndroidStatusBar = async (): Promise<void> => {
  document.documentElement.classList.add('cap-android');
  const { StatusBar } = await import('@capacitor/status-bar');
  const statusBarInfo = await StatusBar.getInfo().catch(() => null);
  if (statusBarInfo?.height) {
    document.documentElement.style.setProperty('--status-bar-height', `${statusBarInfo.height}px`);
  }
};
