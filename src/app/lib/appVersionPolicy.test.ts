import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  checkRequiredAppUpdate,
  compareAppVersion,
  getRequiredAppUpdate,
} from './appVersionPolicy';

const { isNativePlatformMock, getPlatformMock, getInfoMock } = vi.hoisted(() => ({
  isNativePlatformMock: vi.fn(() => true),
  getPlatformMock: vi.fn(() => 'android'),
  getInfoMock: vi.fn(),
}));

vi.mock('@capacitor/core', () => ({
  Capacitor: { isNativePlatform: isNativePlatformMock, getPlatform: getPlatformMock },
}));
vi.mock('@capacitor/app', () => ({ App: { getInfo: getInfoMock } }));

describe('appVersionPolicy', () => {
  it('semantic version strings are compared by numeric parts', () => {
    expect(compareAppVersion('1.0.2', '1.0.2')).toBe(0);
    expect(compareAppVersion('1.0.10', '1.0.2')).toBe(1);
    expect(compareAppVersion('1.0.2', '1.0.3')).toBe(-1);
  });

  it('requires update when current version is below the minimum version', () => {
    expect(
      getRequiredAppUpdate('1.0.1', {
        latestVersion: '1.0.2',
        minimumVersion: '1.0.2',
        updateMessage: '업데이트가 필요합니다.',
        storeUrl: 'https://apps.apple.com/kr/app/tikitak/id6787856530',
      }),
    ).toEqual({
      message: '업데이트가 필요합니다.',
      storeUrl: 'https://apps.apple.com/kr/app/tikitak/id6787856530',
    });
  });

  it('does not require update for the current submission version', () => {
    expect(
      getRequiredAppUpdate('1.0.2', {
        latestVersion: '1.0.2',
        minimumVersion: '1.0.2',
        forceUpdate: false,
      }),
    ).toBeNull();
  });

  it('can force update users below the latest version', () => {
    expect(
      getRequiredAppUpdate('1.0.2', {
        latestVersion: '1.0.3',
        minimumVersion: '1.0.2',
        forceUpdate: true,
      }),
    ).toEqual({
      message: '최신 버전으로 업데이트한 뒤 다시 이용해 주세요.',
      storeUrl: undefined,
    });
  });

  describe('checkRequiredAppUpdate', () => {
    afterEach(() => {
      vi.unstubAllGlobals();
      vi.clearAllMocks();
    });

    it('안드로이드 네이티브에서 android 정책으로 필수 업데이트를 판단한다', async () => {
      isNativePlatformMock.mockReturnValue(true);
      getPlatformMock.mockReturnValue('android');
      getInfoMock.mockResolvedValue({ version: '1.0' });
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          ok: true,
          json: () =>
            Promise.resolve({
              android: {
                minimumVersion: '1.0.1',
                updateMessage: '업데이트해주세요',
                storeUrl: 'https://play.google.com/store/apps/details?id=app.tikitak.space',
              },
            }),
        }),
      );

      await expect(checkRequiredAppUpdate()).resolves.toEqual({
        message: '업데이트해주세요',
        storeUrl: 'https://play.google.com/store/apps/details?id=app.tikitak.space',
      });
    });

    it('네이티브 플랫폼이 아니면 정책을 조회하지 않고 null을 반환한다', async () => {
      isNativePlatformMock.mockReturnValue(false);
      const fetchMock = vi.fn();
      vi.stubGlobal('fetch', fetchMock);

      await expect(checkRequiredAppUpdate()).resolves.toBeNull();
      expect(fetchMock).not.toHaveBeenCalled();
    });
  });
});
