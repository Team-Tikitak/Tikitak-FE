import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useGameMonth } from './useGameMonth';

// 한국 시간 2026-11-30 23:59:30 (UTC 14:59:30) — 30초 뒤면 12월이다
const BEFORE_MONTH_CHANGE = new Date('2026-11-30T14:59:30Z');

describe('useGameMonth', () => {
  beforeEach(() => {
    vi.useFakeTimers({
      now: BEFORE_MONTH_CHANGE,
      toFake: ['setInterval', 'clearInterval', 'Date'],
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('처음에는 지금(한국 시간)의 월을 돌려준다', () => {
    const { result } = renderHook(() => useGameMonth());

    expect(result.current).toBe('2026-11');
  });

  it('화면을 열어 둔 채 월이 바뀌면 1분 안에 새 달로 바뀐다', () => {
    const { result } = renderHook(() => useGameMonth());
    expect(result.current).toBe('2026-11');

    act(() => {
      vi.advanceTimersByTime(61 * 1000);
    });

    expect(result.current).toBe('2026-12');
  });

  it('앱이 백그라운드에서 돌아오면 타이머를 기다리지 않고 바로 새 달로 바뀐다', () => {
    const { result } = renderHook(() => useGameMonth());
    expect(result.current).toBe('2026-11');

    // 타이머는 돌지 않았지만 시간만 흘러 월이 넘어간 상황 (백그라운드에서 멈춘 경우)
    vi.setSystemTime(new Date('2026-12-01T00:10:00Z'));
    act(() => {
      document.dispatchEvent(new Event('visibilitychange'));
    });

    expect(result.current).toBe('2026-12');
  });

  it('월이 그대로면 같은 값을 유지한다', () => {
    const { result } = renderHook(() => useGameMonth());

    act(() => {
      vi.advanceTimersByTime(10 * 1000);
    });

    expect(result.current).toBe('2026-11');
  });

  it('언마운트하면 타이머와 이벤트 리스너를 정리한다', () => {
    const removeSpy = vi.spyOn(document, 'removeEventListener');
    const { unmount } = renderHook(() => useGameMonth());

    unmount();

    expect(vi.getTimerCount()).toBe(0);
    expect(removeSpy).toHaveBeenCalledWith('visibilitychange', expect.any(Function));
    removeSpy.mockRestore();
  });
});
