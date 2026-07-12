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
    expect(result.current.pullTransformStyle).toEqual({
      transform: 'translateY(0px)',
      transition: 'transform 180ms ease-out',
    });
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

  it('회귀: pull 시작 후 손을 떼지 않고 위로 올렸다가 다시 아래로 당기면 인디케이터가 다시 나타난다', () => {
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
    expect(result.current.pullTransformStyle.transform).toBe('translateY(0px)');

    act(() => {
      result.current.touchHandlers.onTouchMove(touchEvent(100));
    });
    expect(result.current.pullDistance).toBeGreaterThan(0);
    expect(result.current.pullTransformStyle.transform).toBe('translateY(50px)');
  });

  it('회귀: 한 번 임계점을 넘긴 같은 터치에서는 인디케이터가 사라졌다 다시 나와도 armed 상태를 유지한다', () => {
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
      result.current.touchHandlers.onTouchMove(touchEvent(140));
    });
    expect(result.current.pullDistance).toBe(70);
    expect(result.current.isRefreshArmed).toBe(true);

    act(() => {
      result.current.touchHandlers.onTouchMove(touchEvent(-20));
    });
    expect(result.current.pullDistance).toBe(0);
    expect(result.current.isRefreshArmed).toBe(true);

    act(() => {
      result.current.touchHandlers.onTouchMove(touchEvent(40));
    });
    expect(result.current.pullDistance).toBe(20);
    expect(result.current.isRefreshArmed).toBe(true);

    act(() => {
      result.current.touchHandlers.onTouchEnd();
    });
    expect(result.current.isRefreshArmed).toBe(false);
  });

  it('처음부터 위로 스크롤하려는 제스처는 기존처럼 pull 추적을 시작하지 않는다', () => {
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
      result.current.touchHandlers.onTouchStart(touchEvent(100));
      result.current.touchHandlers.onTouchMove(touchEvent(80, preventDefault));
    });

    expect(preventDefault).not.toHaveBeenCalled();
    expect(result.current.pullDistance).toBe(0);

    act(() => {
      result.current.touchHandlers.onTouchMove(touchEvent(180));
    });

    expect(result.current.pullDistance).toBe(0);
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
