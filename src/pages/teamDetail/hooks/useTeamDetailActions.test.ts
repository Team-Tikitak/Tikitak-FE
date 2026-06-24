import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { TeamMemberItem } from '@/shared/api/team/types';
import { useTeamDetailActions } from './useTeamDetailActions';

const {
  navigateMock,
  leaveTeamMock,
  teamDeleteMock,
  removeMemberMock,
  openConfirmDialogMock,
  alertDialogMock,
  confirmDialogMock,
  confirmExactTextDialogMock,
  isNativeDialogPlatformMock,
} = vi.hoisted(() => ({
  navigateMock: vi.fn(),
  leaveTeamMock: vi.fn(),
  teamDeleteMock: vi.fn(),
  removeMemberMock: vi.fn(),
  openConfirmDialogMock: vi.fn(),
  alertDialogMock: vi.fn(),
  confirmDialogMock: vi.fn(),
  confirmExactTextDialogMock: vi.fn(),
  isNativeDialogPlatformMock: vi.fn(),
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
vi.mock('@/shared/lib/native/nativeDialog', () => ({
  alertDialog: alertDialogMock,
  confirmDialog: confirmDialogMock,
  confirmExactTextDialog: confirmExactTextDialogMock,
  isNativeDialogPlatform: isNativeDialogPlatformMock,
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
  const params = { teamId: 7, teamName: '우리팀', memberCount: 1 };

  beforeEach(() => {
    vi.resetAllMocks();
    isNativeDialogPlatformMock.mockReturnValue(false);
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

  it('앱에서는 나가기를 네이티브 confirm으로 확인한 뒤 실행한다', async () => {
    isNativeDialogPlatformMock.mockReturnValue(true);
    confirmDialogMock.mockResolvedValue(true);

    const { result } = renderHook(() => useTeamDetailActions(params));
    await result.current.confirmLeave();

    expect(confirmDialogMock).toHaveBeenCalledWith(
      expect.objectContaining({ okButtonTitle: '나가기', cancelButtonTitle: '취소' }),
    );
    expect(openConfirmDialogMock).not.toHaveBeenCalled();
    expect(leaveTeamMock).toHaveBeenCalledWith(7);
  });

  it('앱에서는 그룹 삭제 문구 입력이 맞을 때만 삭제한다', async () => {
    isNativeDialogPlatformMock.mockReturnValue(true);
    confirmExactTextDialogMock.mockResolvedValue(true);

    const { result } = renderHook(() => useTeamDetailActions(params));
    await result.current.confirmDelete();

    expect(confirmExactTextDialogMock).toHaveBeenCalledWith(
      expect.objectContaining({ confirmationText: '삭제하기' }),
    );
    expect(openConfirmDialogMock).not.toHaveBeenCalled();
    expect(teamDeleteMock).toHaveBeenCalledWith(7);
  });

  it('앱에서 그룹 삭제 문구 입력이 틀리면 삭제하지 않는다', async () => {
    isNativeDialogPlatformMock.mockReturnValue(true);
    confirmExactTextDialogMock.mockResolvedValue(false);

    const { result } = renderHook(() => useTeamDetailActions(params));
    await result.current.confirmDelete();

    expect(teamDeleteMock).not.toHaveBeenCalled();
  });

  it('멤버가 2명 이상이면 삭제 시 확인 알림만 띄우고 삭제하지 않는다', () => {
    const { result } = renderHook(() => useTeamDetailActions({ ...params, memberCount: 2 }));
    result.current.confirmDelete();
    expect(alertDialogMock).toHaveBeenCalled();
    expect(openConfirmDialogMock).not.toHaveBeenCalled();
    expect(teamDeleteMock).not.toHaveBeenCalled();
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
