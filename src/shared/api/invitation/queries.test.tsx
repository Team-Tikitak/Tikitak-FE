import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PATHS } from '@/app/routes/paths';
import { postAcceptInvitation } from './api';
import { useAcceptInvitation } from './queries';
import { patchActiveTeam } from '../user/api';
import type { ReactNode } from 'react';

const navigateMock = vi.fn();

vi.mock('react-router', () => ({
  useNavigate: () => navigateMock,
}));

vi.mock('./api', () => ({
  postAcceptInvitation: vi.fn(),
  getInvitationLink: vi.fn(),
  getInvitationPreview: vi.fn(),
  putInvitationLink: vi.fn(),
}));

vi.mock('../user/api', () => ({
  patchActiveTeam: vi.fn(),
}));

describe('useAcceptInvitation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(postAcceptInvitation).mockResolvedValue({
      data: {
        success: true,
        status: 200,
        timestamp: '2026-07-08T00:00:00.000Z',
        data: { teamId: 7, teamName: '초대 팀' },
      },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {
        headers: {},
      },
    } as unknown as Awaited<ReturnType<typeof postAcceptInvitation>>);
    vi.mocked(patchActiveTeam).mockResolvedValue({
      data: {
        success: true,
        status: 200,
        timestamp: '2026-07-08T00:00:00.000Z',
        data: 7,
      },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {
        headers: {},
      },
    } as unknown as Awaited<ReturnType<typeof patchActiveTeam>>);
  });

  it('초대 수락 성공 시 수락한 팀을 활성 팀으로 변경한 뒤 홈으로 이동한다', async () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    const { result } = renderHook(() => useAcceptInvitation(), { wrapper });

    await act(async () => {
      await result.current.mutateAsync({
        token: 'invite-token',
        body: { nickname: '닉네임' },
      });
    });

    expect(patchActiveTeam).toHaveBeenCalledWith({ teamId: 7 });
    expect(navigateMock).toHaveBeenCalledWith(PATHS.HOME, { replace: true });
    expect(vi.mocked(patchActiveTeam).mock.invocationCallOrder[0]).toBeLessThan(
      navigateMock.mock.invocationCallOrder[0],
    );
  });

  it('활성 팀 변경이 실패해도 초대 수락 후 홈으로 이동한다', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.mocked(patchActiveTeam).mockRejectedValue(new Error('active team failed'));
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    const { result } = renderHook(() => useAcceptInvitation(), { wrapper });

    await act(async () => {
      await result.current.mutateAsync({
        token: 'invite-token',
        body: { nickname: '닉네임' },
      });
    });

    expect(patchActiveTeam).toHaveBeenCalledWith({ teamId: 7 });
    expect(navigateMock).toHaveBeenCalledWith(PATHS.HOME, { replace: true });
    expect(errorSpy).toHaveBeenCalledWith('초대 수락 후 활성 팀 변경 실패', expect.any(Error));
  });
});
