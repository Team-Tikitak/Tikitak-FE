import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { PATHS } from '@/app/routes/paths';
import { useSplashGate } from './useSplashGate';

const navigateMock = vi.fn();

vi.mock('react-router', () => ({
  useNavigate: () => navigateMock,
}));

describe('useSplashGate', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    sessionStorage.clear();
    navigateMock.mockClear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('splash-seen 플래그가 있으면 즉시 LOGIN 으로 replace 한다', () => {
    sessionStorage.setItem('splash-seen', '1');

    const { result } = renderHook(() => useSplashGate());

    expect(result.current.alreadySeen).toBe(true);
    expect(navigateMock).toHaveBeenCalledWith(PATHS.LOGIN, { replace: true });
  });

  it('처음 진입이면 타이머 종료 후 fromSplash state 와 view transition 옵션으로 navigate 한다', () => {
    const { result } = renderHook(() => useSplashGate());

    expect(result.current.alreadySeen).toBe(false);
    expect(navigateMock).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(2300);
    });

    expect(sessionStorage.getItem('splash-seen')).toBe('1');
    expect(navigateMock).toHaveBeenCalledWith(PATHS.LOGIN, {
      replace: true,
      state: { fromSplash: true },
      viewTransition: true,
    });
  });

  it('타이머 종료 전에 unmount 되면 navigate 가 호출되지 않는다', () => {
    const { unmount } = renderHook(() => useSplashGate());

    unmount();

    act(() => {
      vi.advanceTimersByTime(2300);
    });

    expect(navigateMock).not.toHaveBeenCalled();
    expect(sessionStorage.getItem('splash-seen')).toBeNull();
  });
});
