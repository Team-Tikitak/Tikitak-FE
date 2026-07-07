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
}));

describe('useInviteAccept', () => {
  beforeEach(() => {
    navigateMock.mockClear();
    tokenParam = 'invite-token';
    accessToken = null;
    previewResult = { data: { teamId: 1, teamName: '티키탁 팀' }, isError: false };
    teamsResult = undefined;
    teamsPending = false;
    sessionStorage.clear();
  });

  it('미로그인 상태에서 확인 시 복귀 경로를 저장하고 로그인으로 이동한다', () => {
    accessToken = null;
    const { result } = renderHook(() => useInviteAccept());

    act(() => {
      result.current.handleConfirm();
    });

    expect(sessionStorage.getItem('redirectAfterLogin')).toBe('/invite/invite-token');
    expect(navigateMock).toHaveBeenCalledWith(PATHS.LOGIN);
  });

  it('로그인 상태에서 확인 시 복귀 경로 저장 없이 프로필 설정으로 join 상태와 이동한다', () => {
    accessToken = 'access-token';
    teamsResult = [{ teamId: 2 }];
    const { result } = renderHook(() => useInviteAccept());

    act(() => {
      result.current.handleConfirm();
    });

    expect(sessionStorage.getItem('redirectAfterLogin')).toBeNull();
    expect(navigateMock).toHaveBeenCalledWith(PATHS.TEAM_PROFILE_SETUP, {
      state: { mode: 'join', token: 'invite-token', name: '티키탁 팀' },
    });
  });

  it('로그인 상태에서 이미 초대 팀에 속해 있으면 홈으로 이동한다', () => {
    accessToken = 'access-token';
    teamsResult = [{ teamId: 1 }];
    const { result } = renderHook(() => useInviteAccept());

    act(() => {
      result.current.handleConfirm();
    });

    expect(sessionStorage.getItem('redirectAfterLogin')).toBeNull();
    expect(navigateMock).toHaveBeenCalledWith(PATHS.HOME);
  });

  it('팀 목록 로딩 중이면 참여 처리를 보류한다', () => {
    accessToken = 'access-token';
    teamsPending = true;
    teamsResult = undefined;
    const { result } = renderHook(() => useInviteAccept());

    act(() => {
      result.current.handleConfirm();
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
