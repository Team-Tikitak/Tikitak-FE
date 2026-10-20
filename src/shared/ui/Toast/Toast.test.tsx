import { act, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Toast } from './Toast';

vi.mock('react-router', () => ({ useMatch: () => false }));

describe('Toast', () => {
  afterEach(() => vi.useRealTimers());

  it('사라지기 전 200ms 동안 퇴장 애니메이션을 재생한다', () => {
    vi.useFakeTimers();
    const unmount = vi.fn();
    render(<Toast message="완료" unmount={unmount} />);

    act(() => vi.advanceTimersByTime(2800));
    expect(screen.getByRole('status')).toHaveClass(
      'motion-safe:animate-[toast-exit_200ms_ease-in_both]',
    );
    expect(unmount).not.toHaveBeenCalled();

    act(() => vi.advanceTimersByTime(200));
    expect(unmount).toHaveBeenCalledOnce();
  });
});
