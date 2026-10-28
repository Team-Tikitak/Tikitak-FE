import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { usePushSyncStore } from '@/shared/stores/pushSyncStore';
import { usePushNotificationSync } from './usePushNotificationSync';

const {
  registerMock,
  getDeviceTokenIfGrantedMock,
  getDeviceTokenMock,
  addListenerMock,
  appAddListenerMock,
  confirmDialogMock,
} = vi.hoisted(() => ({
  registerMock: vi.fn(),
  getDeviceTokenIfGrantedMock: vi.fn(),
  getDeviceTokenMock: vi.fn(),
  addListenerMock: vi.fn(),
  appAddListenerMock: vi.fn(),
  confirmDialogMock: vi.fn(),
}));

vi.mock('@capacitor/core', () => ({
  Capacitor: { isNativePlatform: () => true },
}));

vi.mock('@capacitor/app', () => ({
  App: { addListener: appAddListenerMock },
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
  getDeviceToken: getDeviceTokenMock,
  getDeviceTokenIfGranted: getDeviceTokenIfGrantedMock,
  resolvePlatform: () => 'IOS',
}));

vi.mock('@/shared/lib/native/nativeDialog', () => ({
  confirmDialog: confirmDialogMock,
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
  type MutateOptions = { onSuccess?: () => void; onError?: () => void };
  let emitAppState: (isActive: boolean) => void = () => {};

  beforeEach(() => {
    vi.useFakeTimers();
    vi.resetAllMocks();
    usePushSyncStore.setState({ resyncNonce: 0 });
    getDeviceTokenIfGrantedMock.mockResolvedValue({ fcmToken: 'token-1', platform: 'IOS' });
    appAddListenerMock.mockImplementation(
      async (_event: string, handler: (state: { isActive: boolean }) => void) => {
        emitAppState = (isActive) => handler({ isActive });
        return { remove: vi.fn() };
      },
    );
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

  it('등록이 실패한 토큰은 tokenReceived로 다시 오면 재등록한다', async () => {
    let emitToken: (token: string) => void = () => {};
    addListenerMock.mockImplementation(
      async (_event: string, handler: (event: { token: string }) => void) => {
        emitToken = (token) => handler({ token });
        return { remove: vi.fn() };
      },
    );
    registerMock.mockImplementationOnce((_body: unknown, options?: MutateOptions) =>
      options?.onError?.(),
    );
    renderHook(() => usePushNotificationSync());

    await act(async () => {
      await vi.advanceTimersByTimeAsync(5000);
    });
    expect(registerMock).toHaveBeenCalledTimes(1);

    await act(async () => {
      emitToken('token-1');
      await vi.advanceTimersByTimeAsync(0);
    });

    expect(registerMock).toHaveBeenCalledTimes(2);
    expect(registerMock).toHaveBeenLastCalledWith(
      { fcmToken: 'token-1', platform: 'IOS' },
      expect.anything(),
    );
  });

  const flushStartupSync = async () => {
    await act(async () => {
      await vi.advanceTimersByTimeAsync(5000);
    });
  };

  const returnToForeground = async () => {
    await act(async () => {
      emitAppState(true);
      await vi.advanceTimersByTimeAsync(0);
    });
  };

  it('설정에서 권한을 허용하고 돌아오면 토큰을 등록한다', async () => {
    getDeviceTokenIfGrantedMock.mockResolvedValueOnce(null);
    getDeviceTokenMock.mockResolvedValue({ status: 'just-denied' });
    confirmDialogMock.mockResolvedValue(true);
    renderHook(() => usePushNotificationSync());

    await flushStartupSync();
    expect(registerMock).not.toHaveBeenCalled();

    await returnToForeground();

    expect(registerMock).toHaveBeenCalledWith(
      { fcmToken: 'token-1', platform: 'IOS' },
      expect.anything(),
    );
  });

  it('등록이 실패했으면 포그라운드로 돌아올 때 다시 등록한다', async () => {
    addListenerMock.mockResolvedValue({ remove: vi.fn() });
    registerMock.mockImplementation((_body: unknown, options?: MutateOptions) =>
      options?.onError?.(),
    );
    renderHook(() => usePushNotificationSync());

    await flushStartupSync();
    expect(registerMock).toHaveBeenCalledTimes(1);

    await returnToForeground();

    expect(registerMock).toHaveBeenCalledTimes(2);
  });

  it('이미 등록했으면 포그라운드로 돌아와도 토큰을 다시 확인하지 않는다', async () => {
    renderHook(() => usePushNotificationSync());

    await flushStartupSync();
    expect(registerMock).toHaveBeenCalledTimes(1);
    const checksBeforeForeground = getDeviceTokenIfGrantedMock.mock.calls.length;

    await returnToForeground();

    expect(getDeviceTokenIfGrantedMock).toHaveBeenCalledTimes(checksBeforeForeground);
    expect(registerMock).toHaveBeenCalledTimes(1);
  });

  it('백그라운드로 갈 때는 토큰을 확인하지 않는다', async () => {
    renderHook(() => usePushNotificationSync());

    await flushStartupSync();
    const checksBeforeBackground = getDeviceTokenIfGrantedMock.mock.calls.length;

    await act(async () => {
      emitAppState(false);
      await vi.advanceTimersByTimeAsync(0);
    });

    expect(getDeviceTokenIfGrantedMock).toHaveBeenCalledTimes(checksBeforeBackground);
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
