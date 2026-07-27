import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DESKTOP_WEB_MEDIA_QUERY, useDesktopWebGate } from './useDesktopWebGate';

const { isNativePlatformMock } = vi.hoisted(() => ({
  isNativePlatformMock: vi.fn(() => false),
}));

vi.mock('@capacitor/core', () => ({
  Capacitor: {
    isNativePlatform: isNativePlatformMock,
  },
}));

const originalMatchMedia = window.matchMedia;

const mockMatchMedia = (matches: boolean) => {
  let currentMatches = matches;
  const listeners = new Set<(event: MediaQueryListEvent) => void>();
  const addEventListener = vi.fn();
  const removeEventListener = vi.fn();
  const mediaQuery = {
    get matches() {
      return currentMatches;
    },
    media: DESKTOP_WEB_MEDIA_QUERY,
    addEventListener: (type: string, listener: (event: MediaQueryListEvent) => void) => {
      addEventListener(type, listener);
      if (type === 'change') listeners.add(listener);
    },
    removeEventListener: (type: string, listener: (event: MediaQueryListEvent) => void) => {
      removeEventListener(type, listener);
      listeners.delete(listener);
    },
  };
  const matchMedia = vi.fn(() => mediaQuery);

  Object.defineProperty(window, 'matchMedia', {
    value: matchMedia,
    configurable: true,
  });

  return {
    matchMedia,
    addEventListener,
    removeEventListener,
    setMatches: (nextMatches: boolean) => {
      currentMatches = nextMatches;
      listeners.forEach((listener) => listener({ matches: nextMatches } as MediaQueryListEvent));
    },
  };
};

describe('useDesktopWebGate', () => {
  beforeEach(() => {
    isNativePlatformMock.mockReset();
    isNativePlatformMock.mockReturnValue(false);
  });

  afterEach(() => {
    Object.defineProperty(window, 'matchMedia', {
      value: originalMatchMedia,
      configurable: true,
    });
  });

  it('데스크탑급 웹 환경이면 차단 상태를 반환한다', () => {
    const { matchMedia } = mockMatchMedia(true);

    const { result } = renderHook(() => useDesktopWebGate());

    expect(result.current).toBe(true);
    expect(matchMedia).toHaveBeenCalledWith(DESKTOP_WEB_MEDIA_QUERY);
  });

  it('모바일 웹 환경이면 통과시킨다', () => {
    mockMatchMedia(false);

    const { result } = renderHook(() => useDesktopWebGate());

    expect(result.current).toBe(false);
  });

  it('화면 크기가 바뀌면 차단 상태를 갱신한다', () => {
    const { setMatches } = mockMatchMedia(true);
    const { result } = renderHook(() => useDesktopWebGate());

    act(() => setMatches(false));

    expect(result.current).toBe(false);
  });

  it('네이티브 앱이면 큰 화면이어도 통과시킨다', () => {
    isNativePlatformMock.mockReturnValue(true);
    mockMatchMedia(true);

    const { result } = renderHook(() => useDesktopWebGate());

    expect(result.current).toBe(false);
  });
});
