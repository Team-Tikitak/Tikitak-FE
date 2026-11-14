import { beforeEach, describe, expect, it, vi } from 'vitest';
import { hideNativeSplash } from './splash';

const { isNativePlatform, hide } = vi.hoisted(() => ({
  isNativePlatform: vi.fn(),
  hide: vi.fn(),
}));

vi.mock('@capacitor/core', () => ({ Capacitor: { isNativePlatform } }));
vi.mock('@capacitor/splash-screen', () => ({ SplashScreen: { hide } }));

describe('hideNativeSplash', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    hide.mockResolvedValue(undefined);
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
      callback(0);
      return 0;
    });
  });

  it('웹에서는 스플래시를 건드리지 않는다', async () => {
    isNativePlatform.mockReturnValue(false);

    await hideNativeSplash();

    expect(hide).not.toHaveBeenCalled();
  });

  it('네이티브에서는 첫 화면을 그린 뒤 스플래시를 닫는다', async () => {
    isNativePlatform.mockReturnValue(true);

    await hideNativeSplash();

    expect(window.requestAnimationFrame).toHaveBeenCalledTimes(2);
    expect(hide).toHaveBeenCalledWith({ fadeOutDuration: 200 });
  });

  it('스플래시를 닫지 못해도 예외를 던지지 않는다', async () => {
    isNativePlatform.mockReturnValue(true);
    hide.mockRejectedValue(new Error('already hidden'));

    await expect(hideNativeSplash()).resolves.toBeUndefined();
  });
});
