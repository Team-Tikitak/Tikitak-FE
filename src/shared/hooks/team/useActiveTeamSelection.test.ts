import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { MeResponse, Team } from '@/shared/api/user/types';
import { useActiveTeamSelection } from './useActiveTeamSelection';

const { useMeMock, useGetTeamsMock, patchActiveTeamMock, useTeamPickerSheetMock, navigateMock } =
  vi.hoisted(() => ({
    useMeMock: vi.fn(),
    useGetTeamsMock: vi.fn(),
    patchActiveTeamMock: vi.fn(),
    useTeamPickerSheetMock: vi.fn(),
    navigateMock: vi.fn(),
  }));

vi.mock('react-router', () => ({
  useNavigate: () => navigateMock,
}));
vi.mock('@/shared/api/user/queries', () => ({
  useMe: useMeMock,
  useGetTeams: useGetTeamsMock,
  usePatchActiveTeam: () => ({ mutate: patchActiveTeamMock }),
}));
vi.mock('./useTeamPickerSheet', () => ({
  useTeamPickerSheet: useTeamPickerSheetMock,
}));

const makeTeam = (teamId: number): Team => ({ teamId, name: `팀${teamId}` }) as unknown as Team;

const setMe = (activeTeamId: number | null, isPending = false) =>
  useMeMock.mockReturnValue({
    data: activeTeamId === null ? null : ({ activeTeamId } as MeResponse),
    isPending,
  });

const setTeams = (teams: Team[] | undefined, isPending = false) =>
  useGetTeamsMock.mockReturnValue({ data: teams, isPending });

describe('useActiveTeamSelection', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    useTeamPickerSheetMock.mockReturnValue({ openSheet: vi.fn() });
  });

  it('activeTeamId가 teams에 없으면 첫 번째 팀으로 patch한다', () => {
    setMe(999);
    setTeams([makeTeam(1), makeTeam(2)]);

    renderHook(() => useActiveTeamSelection());

    expect(patchActiveTeamMock).toHaveBeenCalledWith(1);
  });

  it('activeTeamId가 유효하면 patch하지 않는다', () => {
    setMe(2);
    setTeams([makeTeam(1), makeTeam(2)]);

    renderHook(() => useActiveTeamSelection());

    expect(patchActiveTeamMock).not.toHaveBeenCalled();
  });

  it('teams가 비어있으면 patch하지 않는다', () => {
    setMe(1);
    setTeams([]);

    renderHook(() => useActiveTeamSelection());

    expect(patchActiveTeamMock).not.toHaveBeenCalled();
  });

  it('로딩 중이면 patch하지 않는다', () => {
    setMe(999, true);
    setTeams([makeTeam(1)], true);

    renderHook(() => useActiveTeamSelection());

    expect(patchActiveTeamMock).not.toHaveBeenCalled();
  });
});
