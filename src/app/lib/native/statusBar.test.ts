import { beforeEach, describe, expect, it, vi } from 'vitest';
import { setupAndroidStatusBar } from './statusBar';

const {
  getInfoMock,
  setBackgroundColorMock,
  setOverlaysWebViewMock,
  setStatusBarStyleMock,
  showStatusBarMock,
  setSystemBarsStyleMock,
  showSystemBarsMock,
} = vi.hoisted(() => ({
  getInfoMock: vi.fn(() => Promise.resolve({ height: 32 })),
  setBackgroundColorMock: vi.fn(() => Promise.resolve()),
  setOverlaysWebViewMock: vi.fn(() => Promise.resolve()),
  setStatusBarStyleMock: vi.fn(() => Promise.resolve()),
  showStatusBarMock: vi.fn(() => Promise.resolve()),
  setSystemBarsStyleMock: vi.fn(() => Promise.resolve()),
  showSystemBarsMock: vi.fn(() => Promise.resolve()),
}));

vi.mock('@capacitor/status-bar', () => ({
  StatusBar: {
    getInfo: getInfoMock,
    setBackgroundColor: setBackgroundColorMock,
    setOverlaysWebView: setOverlaysWebViewMock,
    setStyle: setStatusBarStyleMock,
    show: showStatusBarMock,
  },
  Style: {
    Light: 'LIGHT',
  },
}));

vi.mock('@capacitor/core', () => ({
  SystemBars: {
    setStyle: setSystemBarsStyleMock,
    show: showSystemBarsMock,
  },
  SystemBarsStyle: {
    Light: 'LIGHT',
  },
}));

describe('setupAndroidStatusBar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    document.documentElement.className = '';
    document.documentElement.style.removeProperty('--status-bar-height');
    getInfoMock.mockResolvedValue({ height: 32 });
  });

  it('Android 시스템 바를 흰 배경 기준 스타일로 맞춘다', async () => {
    await setupAndroidStatusBar();

    expect(document.documentElement.classList.contains('cap-android')).toBe(true);
    expect(document.documentElement.style.getPropertyValue('--status-bar-height')).toBe('32px');
    expect(showStatusBarMock).toHaveBeenCalledTimes(1);
    expect(setOverlaysWebViewMock).toHaveBeenCalledWith({ overlay: true });
    expect(setBackgroundColorMock).toHaveBeenCalledWith({ color: '#ffffff' });
    expect(setStatusBarStyleMock).toHaveBeenCalledWith({ style: 'LIGHT' });
    expect(showSystemBarsMock).toHaveBeenCalledTimes(1);
    expect(setSystemBarsStyleMock).toHaveBeenCalledWith({ style: 'LIGHT' });
  });

  it('status bar 높이를 읽지 못해도 초기화를 중단하지 않는다', async () => {
    getInfoMock.mockRejectedValue(new Error('native unavailable'));

    await expect(setupAndroidStatusBar()).resolves.toBeUndefined();

    expect(document.documentElement.classList.contains('cap-android')).toBe(true);
    expect(document.documentElement.style.getPropertyValue('--status-bar-height')).toBe('');
  });
});
