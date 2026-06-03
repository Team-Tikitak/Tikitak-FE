import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { TeamMemberItem } from '@/shared/api/team/types';
import { useTeamDetailActions } from './useTeamDetailActions';

const { navigateMock, leaveTeamMock, teamDeleteMock, removeMemberMock, openConfirmDialogMock } =
  vi.hoisted(() => ({
    navigateMock: vi.fn(),
    leaveTeamMock: vi.fn(),
    teamDeleteMock: vi.fn(),
    removeMemberMock: vi.fn(),
    openConfirmDialogMock: vi.fn(),
  }));

vi.mock('react-router', () => ({
  useNavigate: () => navigateMock,
}));
vi.mock('@/shared/api/team/queries', () => ({
  useLeaveTeam: () => ({ mutate: leaveTeamMock }),
  useTeamDelete: () => ({ mutate: teamDeleteMock }),
  useDeleteTeamMember: () => ({ mutate: removeMemberMock }),
}));
vi.mock('@/shared/ui/ConfirmDialog', () => ({
  openConfirmDialog: openConfirmDialogMock,
}));

const confirmLast = () => {
  const lastCall = openConfirmDialogMock.mock.calls.at(-1);
  lastCall?.[0]?.onConfirm?.();
};

const makeMember = (teamMemberId: number): TeamMemberItem => ({
  teamMemberId,
  nickname: '홍길동',
  teamMemberRole: 'MEMBER',
  email: 'a@b.com',
  profileImgUrl: '',
});

describe('useTeamDetailActions', () => {
  const params = { teamId: 7, teamName: '우리팀' };

  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('나가기 확인 시 leaveTeam mutation을 teamId로 호출한다', () => {
    const { result } = renderHook(() => useTeamDetailActions(params));
    result.current.confirmLeave();
    confirmLast();
    expect(leaveTeamMock).toHaveBeenCalledWith(7);
  });

  it('멤버 내보내기 확인 시 teamId와 targetTeamMemberId를 전달한다', () => {
    const { result } = renderHook(() => useTeamDetailActions(params));
    result.current.confirmRemoveMember(makeMember(33));
    confirmLast();
    expect(removeMemberMock).toHaveBeenCalledWith({ teamId: 7, targetTeamMemberId: 33 });
  });

  it('삭제 확인 시 postTeamDelete를 teamId로 호출한다', () => {
    const { result } = renderHook(() => useTeamDetailActions(params));
    result.current.confirmDelete();
    confirmLast();
    expect(teamDeleteMock).toHaveBeenCalledWith(7);
  });

  it('프로필 수정 이동 시 edit 모드 state와 함께 navigate한다', () => {
    const { result } = renderHook(() => useTeamDetailActions(params));
    result.current.goEditProfile();
    expect(navigateMock).toHaveBeenCalledWith(
      '/teams/new/profile',
      expect.objectContaining({
        state: expect.objectContaining({ mode: 'edit', teamId: 7, teamName: '우리팀' }),
      }),
    );
  });
});
