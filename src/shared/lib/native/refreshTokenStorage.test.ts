import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  clearStoredRefreshToken,
  readStoredRefreshToken,
  storeRefreshToken,
} from './refreshTokenStorage';

const { isNativePlatformMock, setMock, getMock, removeMock } = vi.hoisted(() => ({
  isNativePlatformMock: vi.fn(),
  setMock: vi.fn(),
  getMock: vi.fn(),
  removeMock: vi.fn(),
}));

vi.mock('@capacitor/core', () => ({
  Capacitor: { isNativePlatform: isNativePlatformMock },
}));
vi.mock('@aparajita/capacitor-secure-storage', () => ({
  SecureStorage: { set: setMock, get: getMock, remove: removeMock },
}));

describe('refreshTokenStorage', () => {
  beforeEach(() => {
    isNativePlatformMock.mockReset().mockReturnValue(true);
    setMock.mockReset().mockResolvedValue(undefined);
    getMock.mockReset();
    removeMock.mockReset().mockResolvedValue(true);
  });

  it('네이티브에서는 iCloud 동기화 없이 보안 저장소에 저장·조회·삭제한다', async () => {
    getMock.mockResolvedValue('stored-token');

    await storeRefreshToken('refresh-1');
    const stored = await readStoredRefreshToken();
    await clearStoredRefreshToken();

    expect(setMock).toHaveBeenCalledWith('tikitak:refresh-token', 'refresh-1', false, false);
    expect(getMock).toHaveBeenCalledWith('tikitak:refresh-token', false, false);
    expect(stored).toBe('stored-token');
    expect(removeMock).toHaveBeenCalledWith('tikitak:refresh-token', false);
  });

  it('웹에서는 플러그인을 건드리지 않고 저장된 토큰 없음으로 동작한다', async () => {
    isNativePlatformMock.mockReturnValue(false);

    await storeRefreshToken('refresh-1');
    const stored = await readStoredRefreshToken();
    await clearStoredRefreshToken();

    expect(stored).toBeNull();
    expect(setMock).not.toHaveBeenCalled();
    expect(getMock).not.toHaveBeenCalled();
    expect(removeMock).not.toHaveBeenCalled();
  });

  it('저장된 값이 없거나 문자열이 아니면 null 이다', async () => {
    getMock.mockResolvedValueOnce(null).mockResolvedValueOnce(123).mockResolvedValueOnce('');

    await expect(readStoredRefreshToken()).resolves.toBeNull();
    await expect(readStoredRefreshToken()).resolves.toBeNull();
    await expect(readStoredRefreshToken()).resolves.toBeNull();
  });

  it('플러그인이 없는 구버전 바이너리처럼 호출이 실패해도 앱을 깨뜨리지 않는다', async () => {
    const notImplemented = new Error('"SecureStorage" plugin is not implemented on ios');
    setMock.mockRejectedValue(notImplemented);
    getMock.mockRejectedValue(notImplemented);
    removeMock.mockRejectedValue(notImplemented);

    await expect(storeRefreshToken('refresh-1')).resolves.toBeUndefined();
    await expect(readStoredRefreshToken()).resolves.toBeNull();
    await expect(clearStoredRefreshToken()).resolves.toBeUndefined();
  });
});
