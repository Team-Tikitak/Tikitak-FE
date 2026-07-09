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

  it('useMe 또는 useGetTeams 중 하나라도 refetch 중이면 isFetching이 true다', () => {
    useMeMock.mockReturnValue({ data: { activeTeamId: 1 } as MeResponse, isFetching: false });
    useGetTeamsMock.mockReturnValue({ data: [makeTeam(1)], isFetching: true });

    const { result } = renderHook(() => useActiveTeamSelection());

    expect(result.current.isFetching).toBe(true);
  });

  it('둘 다 idle이면 isFetching이 false다', () => {
    useMeMock.mockReturnValue({ data: { activeTeamId: 1 } as MeResponse, isFetching: false });
    useGetTeamsMock.mockReturnValue({ data: [makeTeam(1)], isFetching: false });

    const { result } = renderHook(() => useActiveTeamSelection());

    expect(result.current.isFetching).toBe(false);
  });

  it('activeTeamId가 아직 teams에 없어도 백그라운드 리페치 중이면 patch하지 않는다', () => {
    // 새 팀 참여 직후 me는 갱신됐지만 teams 목록이 아직 리페치 중인 race 상황을 재현
    useMeMock.mockReturnValue({
      data: { activeTeamId: 999 } as MeResponse,
      isPending: false,
      isFetching: false,
    });
    useGetTeamsMock.mockReturnValue({
      data: [makeTeam(1)],
      isPending: false,
      isFetching: true,
    });

    renderHook(() => useActiveTeamSelection());

    expect(patchActiveTeamMock).not.toHaveBeenCalled();
  });
});
