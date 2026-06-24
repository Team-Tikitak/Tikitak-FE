import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MyPage } from './MyPage';

const {
  navigateMock,
  logoutMock,
  deleteMeMock,
  useGetTeamsMock,
  alertDialogMock,
  confirmExactTextDialogMock,
  isNativeDialogPlatformMock,
  openConfirmDialogMock,
} = vi.hoisted(() => ({
  navigateMock: vi.fn(),
  logoutMock: vi.fn(),
  deleteMeMock: vi.fn(),
  useGetTeamsMock: vi.fn(),
  alertDialogMock: vi.fn(),
  confirmExactTextDialogMock: vi.fn(),
  isNativeDialogPlatformMock: vi.fn(),
  openConfirmDialogMock: vi.fn(),
}));

vi.mock('react-router', () => ({
  useNavigate: () => navigateMock,
}));

vi.mock('@/app/layout', () => ({
  PageShell: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock('@/shared/api/auth/queries', () => ({
  useLogout: () => ({ mutate: logoutMock }),
}));

vi.mock('@/shared/api/user/queries', () => ({
  useDeleteMe: () => ({ mutate: deleteMeMock }),
  useGetTeams: useGetTeamsMock,
}));

vi.mock('@/shared/lib/native/nativeDialog', () => ({
  alertDialog: alertDialogMock,
  confirmExactTextDialog: confirmExactTextDialogMock,
  isNativeDialogPlatform: isNativeDialogPlatformMock,
}));

vi.mock('@/shared/ui', () => ({
  Header: () => <header />,
  ListCard: ({ title, onClick }: { title: string; onClick: () => void }) => (
    <button type="button" onClick={onClick}>
      {title}
    </button>
  ),
  PageSection: ({ children }: { children: React.ReactNode }) => <section>{children}</section>,
}));

vi.mock('@/shared/ui/ConfirmDialog', () => ({
  openConfirmDialog: openConfirmDialogMock,
}));

vi.mock('./MyPageSkeleton', () => ({
  MyPageSkeleton: () => <div data-testid="skeleton" />,
}));

vi.mock('./MyPageTeamCard', () => ({
  MyPageTeamCard: () => <div data-testid="team-card" />,
}));

vi.mock('@/shared/assets/Icon/PlusIcon.svg?react', () => ({
  default: () => <svg />,
}));

const setTeams = (teams: Array<{ teamId: number; role: 'OWNER' | 'MEMBER' }>) => {
  useGetTeamsMock.mockReturnValue({ data: teams, isPending: false });
};

describe('MyPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    isNativeDialogPlatformMock.mockReturnValue(false);
    setTeams([]);
  });

  it('앱에서는 탈퇴하기 입력 확인이 맞을 때만 회원 탈퇴를 실행한다', async () => {
    isNativeDialogPlatformMock.mockReturnValue(true);
    confirmExactTextDialogMock.mockResolvedValue(true);

    render(<MyPage />);
    fireEvent.click(screen.getByRole('button', { name: '회원 탈퇴' }));

    await waitFor(() => expect(deleteMeMock).toHaveBeenCalledTimes(1));
    expect(confirmExactTextDialogMock).toHaveBeenCalledWith(
      expect.objectContaining({ confirmationText: '탈퇴하기' }),
    );
    expect(openConfirmDialogMock).not.toHaveBeenCalled();
  });

  it('앱에서 탈퇴하기 입력 확인이 틀리면 회원 탈퇴를 실행하지 않는다', async () => {
    isNativeDialogPlatformMock.mockReturnValue(true);
    confirmExactTextDialogMock.mockResolvedValue(false);

    render(<MyPage />);
    fireEvent.click(screen.getByRole('button', { name: '회원 탈퇴' }));

    await waitFor(() => expect(confirmExactTextDialogMock).toHaveBeenCalledTimes(1));
    expect(deleteMeMock).not.toHaveBeenCalled();
  });

  it('팀장인 그룹이 있으면 앱 prompt 없이 탈퇴 불가 알림만 띄운다', () => {
    isNativeDialogPlatformMock.mockReturnValue(true);
    setTeams([{ teamId: 1, role: 'OWNER' }]);

    render(<MyPage />);
    fireEvent.click(screen.getByRole('button', { name: '회원 탈퇴' }));

    expect(alertDialogMock).toHaveBeenCalled();
    expect(confirmExactTextDialogMock).not.toHaveBeenCalled();
    expect(deleteMeMock).not.toHaveBeenCalled();
  });
});
