import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { userKeys } from './keys';
import { usePatchActiveTeam } from './queries';
import type { Team } from './types';
import type { ReactNode } from 'react';

vi.mock('./api', () => ({
  patchActiveTeam: vi.fn(() => Promise.resolve({ data: { data: 2 } })),
}));
vi.mock('react-router', () => ({
  useNavigate: () => vi.fn(),
}));

const createTeam = (teamId: number, isActive: boolean): Team => ({
  teamId,
  teamMemberId: teamId * 10,
  teamName: `team-${teamId}`,
  description: '',
  role: 'MEMBER',
  nickname: 'nick',
  profileImgUrl: `https://example.com/${teamId}.png`,
  memberCount: 3,
  joinedAt: '2026-01-01',
  active: isActive,
  isActive,
});

describe('usePatchActiveTeam', () => {
  it('팀 전환 성공 시 teams 캐시의 isActive 가 새 활성 팀 기준으로 갱신된다', async () => {
    const queryClient = new QueryClient();
    queryClient.setQueryData<Team[]>(userKeys.teams(), [createTeam(1, true), createTeam(2, false)]);
    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    const { result } = renderHook(() => usePatchActiveTeam({ silent: true }), { wrapper });

    await act(async () => {
      await result.current.mutateAsync(2);
    });

    const teams = queryClient.getQueryData<Team[]>(userKeys.teams());
    expect(teams?.find((team) => team.isActive)?.teamId).toBe(2);
    expect(teams?.filter((team) => team.isActive)).toHaveLength(1);
  });
});
