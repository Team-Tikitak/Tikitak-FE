import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { usePullToRefresh } from './usePullToRefresh';
import type { TouchEvent } from 'react';

const touchEvent = (clientY: number, preventDefault = vi.fn()) =>
  ({
    cancelable: true,
    preventDefault,
    touches: [{ clientY }],
  }) as unknown as TouchEvent<HTMLElement>;

describe('usePullToRefresh', () => {
  it('refreshes when released after pulling beyond the threshold at the top', async () => {
    const scrollElement = document.createElement('div');
    const onRefresh = vi.fn();
    const preventDefault = vi.fn();
    const { result } = renderHook(() =>
      usePullToRefresh({
        scrollRef: { current: scrollElement },
        onRefresh,
        threshold: 60,
      }),
    );

    act(() => {
      result.current.touchHandlers.onTouchStart(touchEvent(0));
      result.current.touchHandlers.onTouchMove(touchEvent(140, preventDefault));
    });

    await act(async () => {
      result.current.touchHandlers.onTouchEnd();
    });

    expect(preventDefault).toHaveBeenCalled();
    expect(onRefresh).toHaveBeenCalledTimes(1);
    expect(result.current.pullDistance).toBe(0);
    expect(result.current.isRefreshing).toBe(false);
  });

  it('does not refresh below the threshold', () => {
    const scrollElement = document.createElement('div');
    const onRefresh = vi.fn();
    const { result } = renderHook(() =>
      usePullToRefresh({
        scrollRef: { current: scrollElement },
        onRefresh,
        threshold: 60,
      }),
    );

    act(() => {
      result.current.touchHandlers.onTouchStart(touchEvent(0));
      result.current.touchHandlers.onTouchMove(touchEvent(80));
    });

    act(() => {
      result.current.touchHandlers.onTouchEnd();
    });

    expect(onRefresh).not.toHaveBeenCalled();
    expect(result.current.pullDistance).toBe(0);
  });

  it('회귀: 시작점보다 위로 올리는 move에도 preventDefault를 호출해 네이티브 스크롤 개입을 막는다', () => {
    const scrollElement = document.createElement('div');
    const onRefresh = vi.fn();
    const { result } = renderHook(() =>
      usePullToRefresh({
        scrollRef: { current: scrollElement },
        onRefresh,
        threshold: 60,
      }),
    );

    act(() => {
      result.current.touchHandlers.onTouchStart(touchEvent(0));
      result.current.touchHandlers.onTouchMove(touchEvent(100));
    });
    expect(result.current.pullDistance).toBeGreaterThan(0);

    const preventDefault = vi.fn();
    act(() => {
      result.current.touchHandlers.onTouchMove(touchEvent(-20, preventDefault));
    });
    expect(preventDefault).toHaveBeenCalled();
    expect(result.current.pullDistance).toBe(0);

    act(() => {
      result.current.touchHandlers.onTouchMove(touchEvent(100));
    });
    expect(result.current.pullDistance).toBeGreaterThan(0);
  });

  it('does not track pulls while the scroll container is not at the top', () => {
    const scrollElement = document.createElement('div');
    scrollElement.scrollTop = 12;
    const onRefresh = vi.fn();
    const { result } = renderHook(() =>
      usePullToRefresh({
        scrollRef: { current: scrollElement },
        onRefresh,
        threshold: 60,
      }),
    );

    act(() => {
      result.current.touchHandlers.onTouchStart(touchEvent(0));
      result.current.touchHandlers.onTouchMove(touchEvent(200));
      result.current.touchHandlers.onTouchEnd();
    });

    expect(onRefresh).not.toHaveBeenCalled();
    expect(result.current.pullDistance).toBe(0);
  });
});
