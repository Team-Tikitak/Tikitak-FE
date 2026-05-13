import { renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useTeamInvite } from './useTeamInvite';

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

    await result.current.handleCopy();

    expect(writeText).toHaveBeenCalledWith(result.current.inviteUrl);
  });

  it('writeText 가 실패해도 에러를 throw 하지 않는다', async () => {
    writeText.mockRejectedValueOnce(new Error('denied'));
    const { result } = renderHook(() => useTeamInvite());

    await expect(result.current.handleCopy()).resolves.toBeUndefined();
  });
});
