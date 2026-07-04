import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useKeyboardVisible } from './useKeyboardVisible';

describe('useKeyboardVisible', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('keeps controls hidden briefly while the keyboard layout settles after blur', () => {
    vi.useFakeTimers();
    const input = document.createElement('input');
    document.body.appendChild(input);

    const { result, unmount } = renderHook(() => useKeyboardVisible());

    act(() => {
      input.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
    });

    expect(result.current).toBe(true);

    act(() => {
      input.dispatchEvent(new FocusEvent('focusout', { bubbles: true }));
      vi.advanceTimersByTime(0);
    });

    expect(result.current).toBe(true);

    act(() => {
      vi.advanceTimersByTime(279);
    });

    expect(result.current).toBe(true);

    act(() => {
      vi.advanceTimersByTime(1);
    });

    expect(result.current).toBe(false);

    unmount();
    input.remove();
  });

  it('cancels pending hide when refocused before the keyboard layout settles', () => {
    vi.useFakeTimers();
    const input = document.createElement('input');
    document.body.appendChild(input);

    const { result, unmount } = renderHook(() => useKeyboardVisible());

    act(() => {
      input.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
    });

    expect(result.current).toBe(true);

    act(() => {
      input.dispatchEvent(new FocusEvent('focusout', { bubbles: true }));
      vi.advanceTimersByTime(0);
      vi.advanceTimersByTime(100);
      input.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
      vi.advanceTimersByTime(280);
    });

    expect(result.current).toBe(true);

    unmount();
    input.remove();
  });
});
