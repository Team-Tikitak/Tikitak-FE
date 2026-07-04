import { renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useEdgeSwipeBack } from './useEdgeSwipeBack';

const { navigateMock } = vi.hoisted(() => ({
  navigateMock: vi.fn(),
}));

vi.mock('@capacitor/core', () => ({
  Capacitor: {
    getPlatform: () => 'ios',
  },
}));

vi.mock('react-router', () => ({
  useNavigate: () => navigateMock,
}));

const dispatchPointerEvent = (type: string, init: PointerEventInit) => {
  window.dispatchEvent(new PointerEvent(type, { pointerType: 'touch', ...init }));
};

describe('useEdgeSwipeBack', () => {
  const originalHistoryState = window.history.state;

  beforeEach(() => {
    navigateMock.mockReset();
    window.history.replaceState({ idx: 1 }, '');
  });

  afterEach(() => {
    window.history.replaceState(originalHistoryState, '');
    vi.restoreAllMocks();
  });

  it('does not navigate before the swipe reaches the trigger distance', () => {
    renderHook(() => useEdgeSwipeBack());

    dispatchPointerEvent('pointerdown', { clientX: 12, clientY: 100 });
    dispatchPointerEvent('pointermove', { clientX: 99, clientY: 104 });
    dispatchPointerEvent('pointerup', { clientX: 99, clientY: 104 });

    expect(navigateMock).not.toHaveBeenCalled();
  });

  it('navigates back after swiping past the trigger distance from the left edge', () => {
    renderHook(() => useEdgeSwipeBack());

    dispatchPointerEvent('pointerdown', { clientX: 12, clientY: 100 });
    dispatchPointerEvent('pointermove', { clientX: 101, clientY: 104 });

    expect(navigateMock).toHaveBeenCalledWith(-1);
  });
});
