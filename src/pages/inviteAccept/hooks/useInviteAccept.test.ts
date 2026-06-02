import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PATHS } from '@/app/routes/paths';
import { useInviteAccept } from './useInviteAccept';

const navigateMock = vi.fn();
let tokenParam: string | undefined = 'invite-token';
let accessToken: string | null = null;
let previewResult: { data: { teamName: string } | undefined; isError: boolean } = {
  data: { teamName: '티키탁 팀' },
  isError: false,
};

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
vi.mock('@/app/routes/loaders', () => ({
  REDIRECT_AFTER_LOGIN_KEY: 'redirectAfterLogin',
}));

describe('useInviteAccept', () => {
  beforeEach(() => {
    navigateMock.mockClear();
    tokenParam = 'invite-token';
    accessToken = null;
    previewResult = { data: { teamName: '티키탁 팀' }, isError: false };
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
    const { result } = renderHook(() => useInviteAccept());

    act(() => {
      result.current.handleConfirm();
    });

    expect(sessionStorage.getItem('redirectAfterLogin')).toBeNull();
    expect(navigateMock).toHaveBeenCalledWith(PATHS.TEAM_PROFILE_SETUP, {
      state: { mode: 'join', token: 'invite-token', name: '티키탁 팀' },
    });
  });

  it('preview 에러는 isInvalidInvite 로 노출하고 teamName 은 빈 문자열이다', () => {
    previewResult = { data: undefined, isError: true };
    const { result } = renderHook(() => useInviteAccept());

    expect(result.current.isInvalidInvite).toBe(true);
    expect(result.current.teamName).toBe('');
  });
});
