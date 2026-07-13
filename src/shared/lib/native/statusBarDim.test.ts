import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@capacitor/core', () => ({
  Capacitor: {
    getPlatform: vi.fn(() => 'android'),
    isNativePlatform: vi.fn(() => true),
  },
  SystemBars: {
    setStyle: vi.fn(() => Promise.resolve()),
  },
  SystemBarsStyle: {
    Light: 'LIGHT',
  },
}));

vi.mock('@capacitor/status-bar', () => ({
  StatusBar: {
    setBackgroundColor: vi.fn(() => Promise.resolve()),
    setStyle: vi.fn(() => Promise.resolve()),
  },
  Style: {
    Light: 'LIGHT',
  },
}));

const importStatusBarDim = async () => {
  vi.resetModules();
  const statusBarDim = await import('./statusBarDim');
  const core = await import('@capacitor/core');
  const statusBar = await import('@capacitor/status-bar');

  return { ...statusBarDim, core, statusBar };
};

describe('statusBarDim', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    document.head.innerHTML = '<meta name="theme-color" content="#ffffff" />';
    document.documentElement.className = 'cap-android';
    document.body.className = '';
  });

  it('첫 바텀시트가 열리면 Android 시스템 바 safe-area를 dim 처리한다', async () => {
    const { core, pushStatusBarDim, statusBar } = await importStatusBarDim();

    pushStatusBarDim();
    await vi.waitFor(() => expect(statusBar.StatusBar.setBackgroundColor).toHaveBeenCalled());

    expect(document.querySelector('meta[name="theme-color"]')).toHaveAttribute(
      'content',
      '#808080',
    );
    expect(document.documentElement).toHaveClass('android-status-bar-dimmed');
    expect(document.body).toHaveClass('android-status-bar-dimmed');
    expect(statusBar.StatusBar.setBackgroundColor).toHaveBeenCalledWith({ color: '#808080' });
    expect(statusBar.StatusBar.setStyle).toHaveBeenCalledWith({ style: 'LIGHT' });
    expect(core.SystemBars.setStyle).toHaveBeenCalledWith({ style: 'LIGHT' });
  });

  it('마지막 바텀시트가 닫히면 기본 시스템 바로 복구한다', async () => {
    const { popStatusBarDim, pushStatusBarDim } = await importStatusBarDim();

    pushStatusBarDim();
    pushStatusBarDim();
    popStatusBarDim();
    popStatusBarDim();

    expect(document.querySelector('meta[name="theme-color"]')).toHaveAttribute(
      'content',
      '#ffffff',
    );
    expect(document.documentElement).not.toHaveClass('android-status-bar-dimmed');
    expect(document.body).not.toHaveClass('android-status-bar-dimmed');
  });

  it('iOS에서는 Android 시스템 바 클래스를 붙이지 않는다', async () => {
    document.documentElement.className = '';
    const { core, pushStatusBarDim, statusBar } = await importStatusBarDim();
    vi.mocked(core.Capacitor.getPlatform).mockReturnValue('ios');

    pushStatusBarDim();
    await vi.waitFor(() => expect(core.Capacitor.getPlatform).toHaveBeenCalled());

    expect(document.documentElement).not.toHaveClass('android-status-bar-dimmed');
    expect(document.body).not.toHaveClass('android-status-bar-dimmed');
    expect(statusBar.StatusBar.setBackgroundColor).not.toHaveBeenCalled();
  });
});
