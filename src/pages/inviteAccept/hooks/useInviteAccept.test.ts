import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PATHS } from '@/app/routes/paths';
import { useInviteAccept } from './useInviteAccept';

const navigateMock = vi.fn();
let tokenParam: string | undefined = 'invite-token';
let accessToken: string | null = null;
let previewResult: { data: { teamId: number; teamName: string } | undefined; isError: boolean } = {
  data: { teamId: 1, teamName: '티키탁 팀' },
  isError: false,
};
let teamsResult: Array<{ teamId: number }> | undefined;
let teamsPending = false;
let patchActiveTeamPending = false;
const patchActiveTeamMock = vi.fn();

vi.mock('react-router', () => ({
  useNavigate: () => navigateMock,
  useParams: () => ({ token: tokenParam }),
}));
vi.mock('@/shared/api/instance', () => ({
  getAccessToken: () => accessToken,
}));
vi.mock('@/shared/api/invitation/queries', () => ({
  useInvitationPreview: () => previewResult,
}));
vi.mock('@/shared/api/user/queries', () => ({
  useGetTeams: ({ enabled = true } = {}) => ({
    data: enabled ? teamsResult : undefined,
    isPending: enabled ? teamsPending : false,
  }),
  usePatchActiveTeam: () => ({
    mutateAsync: patchActiveTeamMock,
    isPending: patchActiveTeamPending,
  }),
}));

describe('useInviteAccept', () => {
  beforeEach(() => {
    navigateMock.mockClear();
    patchActiveTeamMock.mockReset();
    tokenParam = 'invite-token';
    accessToken = null;
    previewResult = { data: { teamId: 1, teamName: '티키탁 팀' }, isError: false };
    teamsResult = undefined;
    teamsPending = false;
    patchActiveTeamPending = false;
    patchActiveTeamMock.mockResolvedValue(undefined);
    sessionStorage.clear();
  });

  it('미로그인 상태에서 확인 시 복귀 경로를 저장하고 로그인으로 이동한다', async () => {
    accessToken = null;
    const { result } = renderHook(() => useInviteAccept());

    await act(async () => {
      await result.current.handleConfirm();
    });

    expect(sessionStorage.getItem('redirectAfterLogin')).toBe('/invite/invite-token');
    expect(navigateMock).toHaveBeenCalledWith(PATHS.LOGIN);
  });

  it('로그인 상태에서 확인 시 복귀 경로 저장 없이 프로필 설정으로 join 상태와 이동한다', async () => {
    accessToken = 'access-token';
    teamsResult = [{ teamId: 2 }];
    const { result } = renderHook(() => useInviteAccept());

    await act(async () => {
      await result.current.handleConfirm();
    });

    expect(sessionStorage.getItem('redirectAfterLogin')).toBeNull();
    expect(navigateMock).toHaveBeenCalledWith(PATHS.TEAM_PROFILE_SETUP, {
      state: { mode: 'join', token: 'invite-token', name: '티키탁 팀' },
    });
  });

  it('로그인 상태에서 이미 초대 팀에 속해 있으면 활성 팀을 변경하고 홈으로 이동한다', async () => {
    accessToken = 'access-token';
    teamsResult = [{ teamId: 1 }];
    const { result } = renderHook(() => useInviteAccept());

    await act(async () => {
      await result.current.handleConfirm();
    });

    expect(sessionStorage.getItem('redirectAfterLogin')).toBeNull();
    expect(patchActiveTeamMock).toHaveBeenCalledWith(1);
    expect(navigateMock).toHaveBeenCalledWith(PATHS.HOME, { replace: true });
  });

  it('팀 목록 로딩 중이면 참여 처리를 보류한다', async () => {
    accessToken = 'access-token';
    teamsPending = true;
    teamsResult = undefined;
    const { result } = renderHook(() => useInviteAccept());

    await act(async () => {
      await result.current.handleConfirm();
    });

    expect(result.current.isCheckingMembership).toBe(true);
    expect(navigateMock).not.toHaveBeenCalled();
  });

  it('preview 에러는 isInvalidInvite 로 노출하고 teamName 은 빈 문자열이다', () => {
    previewResult = { data: undefined, isError: true };
    const { result } = renderHook(() => useInviteAccept());

    expect(result.current.isInvalidInvite).toBe(true);
    expect(result.current.teamName).toBe('');
  });
});
