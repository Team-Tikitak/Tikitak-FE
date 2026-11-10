import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, it, expect } from 'vitest';
import { restoreClonedScrollPositions, useScrollRestore } from './useScrollRestore';

describe('useScrollRestore', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it('should return scrollRef and handleScroll', () => {
    const { result } = renderHook(() => useScrollRestore(null, { ready: true, contentSignal: 1 }));

    expect(result.current.scrollRef).toBeDefined();
    expect(typeof result.current.handleScroll).toBe('function');
  });

  it('should return restored=true when key is null', () => {
    const { result } = renderHook(() => useScrollRestore(null, { ready: true, contentSignal: 1 }));

    expect(result.current.restored).toBe(true);
    expect(result.current.isRestored()).toBe(true);
  });

  it('should return restored=false initially when key is provided', () => {
    const { result } = renderHook(() =>
      useScrollRestore('scroll-key', { ready: false, contentSignal: 1 }),
    );

    expect(result.current.restored).toBe(false);
    expect(result.current.isRestored()).toBe(false);
  });

  it('복원 완료 여부를 상태 반영 전에도 동기 조회할 수 있다', () => {
    const { result } = renderHook(() =>
      useScrollRestore('scroll-key', { ready: true, contentSignal: 1 }),
    );

    expect(result.current.isRestored()).toBe(true);
  });

  it('should handle scroll event', () => {
    const { result } = renderHook(() =>
      useScrollRestore('scroll-key', { ready: true, contentSignal: 1 }),
    );

    const mockScrollEvent = {
      currentTarget: { scrollTop: 100 } as HTMLDivElement,
    } as React.UIEvent<HTMLDivElement>;

    expect(() => {
      result.current.handleScroll(mockScrollEvent);
    }).not.toThrow();
  });

  it('현재 스크롤 위치를 즉시 저장한다', () => {
    const { result } = renderHook(() =>
      useScrollRestore('scroll-key', { ready: true, contentSignal: 1 }),
    );
    const scrollElement = document.createElement('div');
    Object.defineProperty(scrollElement, 'scrollTop', { configurable: true, value: 372 });
    result.current.scrollRef.current = scrollElement;

    act(() => {
      result.current.saveScrollPosition();
    });

    expect(sessionStorage.getItem('scroll-key')).toBe('372');
  });
});

describe('restoreClonedScrollPositions', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it('복제된 페이지의 스크롤 컨테이너에 저장된 위치를 다시 적용한다', () => {
    sessionStorage.setItem('my-page-scroll', '240');
    const page = document.createElement('div');
    const container = document.createElement('div');
    container.setAttribute('data-scroll-restore-key', 'my-page-scroll');
    page.appendChild(container);

    restoreClonedScrollPositions(page);

    expect(container.scrollTop).toBe(240);
  });
});
