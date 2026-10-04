import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { PATHS } from '@/app/routes/paths';
import {
  setPendingPushDeepLink,
  takePendingPushDeepLink,
} from '@/shared/lib/native/pendingPushDeepLink';
import { useSplashGate } from './useSplashGate';

const navigateMock = vi.fn();
const { getLaunchUrlMock, isNativePlatformMock, restoreSessionMock } = vi.hoisted(() => ({
  getLaunchUrlMock: vi.fn<() => Promise<{ url: string } | undefined>>(() =>
    Promise.resolve(undefined),
  ),
  isNativePlatformMock: vi.fn(() => false),
  restoreSessionMock: vi.fn(() => Promise.resolve('unauthenticated')),
}));

vi.mock('@capacitor/app', () => ({
  App: {
    getLaunchUrl: getLaunchUrlMock,
  },
}));
vi.mock('@capacitor/core', () => ({
  Capacitor: {
    isNativePlatform: isNativePlatformMock,
  },
}));
vi.mock('react-router', () => ({
  useNavigate: () => navigateMock,
}));
vi.mock('@/shared/api/auth/restoreSession', () => ({
  restoreSession: restoreSessionMock,
}));

describe('useSplashGate', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    sessionStorage.clear();
    navigateMock.mockClear();
    getLaunchUrlMock.mockReset();
    getLaunchUrlMock.mockResolvedValue(undefined);
    isNativePlatformMock.mockReset();
    isNativePlatformMock.mockReturnValue(false);
    restoreSessionMock.mockReset();
    restoreSessionMock.mockResolvedValue('unauthenticated');
  });

  afterEach(() => {
    takePendingPushDeepLink();
    vi.useRealTimers();
  });

  it('splash-seen 플래그가 있으면 즉시 LOGIN 으로 replace 한다', () => {
    sessionStorage.setItem('splash-seen', '1');

    const { result } = renderHook(() => useSplashGate());

    expect(result.current.alreadySeen).toBe(true);
    expect(navigateMock).toHaveBeenCalledWith(PATHS.LOGIN, { replace: true });
  });

  it('세션 복원 실패 시 타이머 종료 후 fromSplash state 로 LOGIN 한다', async () => {
    restoreSessionMock.mockResolvedValue('unauthenticated');

    const { result } = renderHook(() => useSplashGate({ animationStarted: true }));

    expect(result.current.alreadySeen).toBe(false);
    expect(navigateMock).not.toHaveBeenCalled();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(2300);
    });

    expect(sessionStorage.getItem('splash-seen')).toBe('1');
    expect(navigateMock).toHaveBeenCalledWith(PATHS.LOGIN, {
      replace: true,
      state: { fromSplash: true },
    });
  });

  it('앱 초대 딥링크 콜드스타트이면 스플래시 없이 초대장으로 replace 한다', async () => {
    isNativePlatformMock.mockReturnValue(true);
    getLaunchUrlMock.mockResolvedValue({ url: 'tikitak://invite/invite-token' });

    const { result } = renderHook(() => useSplashGate({ animationStarted: false }));

    expect(result.current.isCheckingLaunchInvite).toBe(true);

    await act(async () => {
      await Promise.resolve();
    });

    expect(sessionStorage.getItem('splash-seen')).toBe('1');
    expect(restoreSessionMock).not.toHaveBeenCalled();
    expect(navigateMock).toHaveBeenCalledWith('/invite/invite-token', { replace: true });
  });

  it('네이티브 콜드스타트 URL 이 초대 링크가 아니면 스플래시 체크를 종료한다', async () => {
    isNativePlatformMock.mockReturnValue(true);
    getLaunchUrlMock.mockResolvedValue({ url: 'tikitak://home' });

    const { result } = renderHook(() => useSplashGate({ animationStarted: false }));

    expect(result.current.isCheckingLaunchInvite).toBe(true);

    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.isCheckingLaunchInvite).toBe(false);
    expect(navigateMock).not.toHaveBeenCalled();
    expect(restoreSessionMock).not.toHaveBeenCalled();
  });

  it('서버 장애로 세션을 확인하지 못하면 로그아웃과 구분해 sessionUnavailable state 로 LOGIN 한다', async () => {
    restoreSessionMock.mockResolvedValue('unavailable');

    renderHook(() => useSplashGate({ animationStarted: true }));

    await act(async () => {
      await vi.advanceTimersByTimeAsync(2300);
    });

    expect(navigateMock).toHaveBeenCalledWith(PATHS.LOGIN, {
      replace: true,
      state: { fromSplash: true, sessionUnavailable: true },
    });
  });

  it('세션 복원 성공 시 타이머 종료 후 HOME 으로 navigate 한다', async () => {
    restoreSessionMock.mockResolvedValue('authenticated');

    renderHook(() => useSplashGate({ animationStarted: true }));

    await act(async () => {
      await vi.advanceTimersByTimeAsync(2300);
    });

    expect(sessionStorage.getItem('splash-seen')).toBe('1');
    expect(navigateMock).toHaveBeenCalledWith(PATHS.HOME, { replace: true });
  });

  it('푸시 알림으로 진입했다면 스플래시 시간을 기다리지 않고 세션 복원 직후 이동한다', async () => {
    restoreSessionMock.mockResolvedValue('authenticated');
    setPendingPushDeepLink({ type: 'FEED_COMMENT', feedId: '1' });

    renderHook(() => useSplashGate({ animationStarted: true }));

    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });

    expect(navigateMock).toHaveBeenCalledWith(PATHS.HOME, { replace: true });
  });

  it('스플래시 진행 중 푸시가 들어오면 남은 시간을 건너뛰고 이동한다', async () => {
    restoreSessionMock.mockResolvedValue('authenticated');

    renderHook(() => useSplashGate({ animationStarted: true }));

    await act(async () => {
      await vi.advanceTimersByTimeAsync(500);
    });
    expect(navigateMock).not.toHaveBeenCalled();

    await act(async () => {
      setPendingPushDeepLink({ type: 'FEED_COMMENT', feedId: '1' });
      await vi.advanceTimersByTimeAsync(0);
    });

    expect(navigateMock).toHaveBeenCalledTimes(1);
    expect(navigateMock).toHaveBeenCalledWith(PATHS.HOME, { replace: true });
  });

  it('animationStarted 가 false 이면 타이머가 지나도 navigate 하지 않는다', async () => {
    renderHook(() => useSplashGate({ animationStarted: false }));

    await act(async () => {
      await vi.advanceTimersByTimeAsync(2300);
    });

    expect(navigateMock).not.toHaveBeenCalled();
    expect(sessionStorage.getItem('splash-seen')).toBeNull();
  });

  it('타이머 종료 전에 unmount 되면 navigate 가 호출되지 않는다', async () => {
    const { unmount } = renderHook(() => useSplashGate({ animationStarted: true }));

    unmount();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(2300);
    });

    expect(navigateMock).not.toHaveBeenCalled();
    expect(sessionStorage.getItem('splash-seen')).toBeNull();
  });
});
