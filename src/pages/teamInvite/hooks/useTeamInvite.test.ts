import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useTeamInvite } from './useTeamInvite';

vi.mock('react-router', () => ({
  useParams: () => ({ teamId: '1' }),
}));

vi.mock('@/shared/api/invitation/queries', () => ({
  useInvitationLink: () => ({
    data: { teamName: '테스트팀', inviteToken: 'test-token', expiresAt: '2099-01-01' },
  }),
}));

describe('useTeamInvite', () => {
  let writeText: ReturnType<typeof vi.fn>;
  const originalClipboard = navigator.clipboard;

  beforeEach(() => {
    writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      configurable: true,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    Object.defineProperty(navigator, 'clipboard', {
      value: originalClipboard,
      configurable: true,
    });
  });

  it('teamName 과 inviteUrl 을 노출한다', () => {
    const { result } = renderHook(() => useTeamInvite());

    expect(result.current.teamName).toBeTruthy();
    expect(result.current.inviteUrl).toMatch(/invite/);
  });

  it('handleCopy 는 inviteUrl 로 clipboard.writeText 를 호출한다', async () => {
    const { result } = renderHook(() => useTeamInvite());

    await act(async () => result.current.handleCopy());

    expect(writeText).toHaveBeenCalledWith(result.current.inviteUrl);
    expect(result.current.copyStatus).toBe('success');
  });

  it('writeText 가 실패해도 에러를 throw 하지 않는다', async () => {
    writeText.mockRejectedValueOnce(new Error('denied'));
    const { result } = renderHook(() => useTeamInvite());

    await act(async () => {
      await expect(result.current.handleCopy()).resolves.toBeUndefined();
    });
    expect(result.current.copyStatus).toBe('error');
  });

  it.each(['success', 'error'] as const)(
    '연속 복사 %s 시 피드백을 2초 더 유지한다',
    async (status) => {
      vi.useFakeTimers();
      if (status === 'error') writeText.mockRejectedValue(new Error('denied'));
      const { result } = renderHook(() => useTeamInvite());
      await act(async () => result.current.handleCopy());
      act(() => vi.advanceTimersByTime(1500));
      await act(async () => result.current.handleCopy());
      act(() => vi.advanceTimersByTime(500));
      expect(result.current.copyStatus).toBe(status);
      act(() => vi.advanceTimersByTime(1500));
      expect(result.current.copyStatus).toBe('idle');
    },
  );
});
