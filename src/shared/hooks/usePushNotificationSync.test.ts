import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { usePushSyncStore } from '@/shared/stores/pushSyncStore';
import { usePushNotificationSync } from './usePushNotificationSync';

const { registerMock, getDeviceTokenIfGrantedMock, addListenerMock } = vi.hoisted(() => ({
  registerMock: vi.fn(),
  getDeviceTokenIfGrantedMock: vi.fn(),
  addListenerMock: vi.fn(),
}));

vi.mock('@capacitor/core', () => ({
  Capacitor: { isNativePlatform: () => true },
}));

vi.mock('@capacitor-firebase/messaging', () => ({
  FirebaseMessaging: { addListener: addListenerMock },
}));

vi.mock('@/shared/api/notification/queries', () => ({
  useRegisterDeviceToken: () => ({ mutate: registerMock }),
}));

vi.mock('@/shared/api/user/queries', () => ({
  useGetAgreements: () => ({ data: { termsAgreed: true, privacyAgreed: true } }),
}));

vi.mock('@/shared/lib/native/deviceTokenStorage', () => ({
  readPushEnabled: () => Promise.resolve(true),
  storeDeviceToken: vi.fn(),
}));

vi.mock('@/shared/lib/native/getDeviceToken', () => ({
  getDeviceToken: vi.fn(),
  getDeviceTokenIfGranted: getDeviceTokenIfGrantedMock,
  resolvePlatform: () => 'IOS',
}));

vi.mock('@/shared/lib/native/nativeDialog', () => ({
  confirmDialog: vi.fn(),
}));

vi.mock('@/shared/lib/native/openAppSettings', () => ({
  openAppSettings: vi.fn(),
}));

vi.mock('@/shared/stores/authStore', () => {
  const state = { accessToken: 'access-token' };
  return {
    useAuthStore: (selector: (current: typeof state) => unknown) => selector(state),
  };
});

describe('usePushNotificationSync', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
    usePushSyncStore.setState({ resyncNonce: 0 });
    getDeviceTokenIfGrantedMock.mockResolvedValue({ fcmToken: 'token-1', platform: 'IOS' });
    // 실제 플러그인처럼 리스너를 붙이자마자 보관된 같은 토큰을 한 번 더 전달한다
    addListenerMock.mockImplementation(
      async (_event: string, handler: (event: { token: string }) => void) => {
        queueMicrotask(() => handler({ token: 'token-1' }));
        return { remove: vi.fn() };
      },
    );
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('앱 시작 시에는 바로 등록하지 않고 잠시 뒤에 등록한다', async () => {
    renderHook(() => usePushNotificationSync());

    await act(async () => {
      await vi.advanceTimersByTimeAsync(4000);
    });
    expect(registerMock).not.toHaveBeenCalled();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1000);
    });
    expect(registerMock).toHaveBeenCalledWith(
      { fcmToken: 'token-1', platform: 'IOS' },
      expect.anything(),
    );
  });

  it('tokenReceived가 같은 토큰을 다시 보내도 한 번만 등록한다', async () => {
    renderHook(() => usePushNotificationSync());

    await act(async () => {
      await vi.advanceTimersByTimeAsync(5000);
    });

    expect(addListenerMock).toHaveBeenCalledWith('tokenReceived', expect.any(Function));
    expect(registerMock).toHaveBeenCalledTimes(1);
  });

  it('명시적인 재동기화 요청은 기다리지 않고 바로 등록한다', async () => {
    usePushSyncStore.setState({ resyncNonce: 1 });
    renderHook(() => usePushNotificationSync());

    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });

    expect(registerMock).toHaveBeenCalledTimes(1);
  });
});
