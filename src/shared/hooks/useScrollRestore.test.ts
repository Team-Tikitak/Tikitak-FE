import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useScrollRestore } from './useScrollRestore';

describe('useScrollRestore', () => {
  it('should return scrollRef and handleScroll', () => {
    const { result } = renderHook(() => useScrollRestore(null, { ready: true, contentSignal: 1 }));

    expect(result.current.scrollRef).toBeDefined();
    expect(typeof result.current.handleScroll).toBe('function');
  });

  it('should return restored=true when key is null', () => {
    const { result } = renderHook(() => useScrollRestore(null, { ready: true, contentSignal: 1 }));

    expect(result.current.restored).toBe(true);
  });

  it('should return restored=false initially when key is provided', () => {
    const { result } = renderHook(() =>
      useScrollRestore('scroll-key', { ready: false, contentSignal: 1 }),
    );

    expect(result.current.restored).toBe(false);
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
});
