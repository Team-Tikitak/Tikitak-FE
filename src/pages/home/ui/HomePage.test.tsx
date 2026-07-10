import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { HomePage } from './HomePage';

const { navigateMock, useActiveTeamSelectionMock, mapViewMock } = vi.hoisted(() => ({
  navigateMock: vi.fn(),
  useActiveTeamSelectionMock: vi.fn(),
  mapViewMock: vi.fn(),
}));

vi.mock('react-router', () => ({
  useNavigate: () => navigateMock,
}));

vi.mock('@/app/layout', () => ({
  PageShell: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock('@/shared/hooks/team/useActiveTeamSelection', () => ({
  useActiveTeamSelection: useActiveTeamSelectionMock,
}));

vi.mock('@/shared/hooks/useHasUnreadNotifications', () => ({
  useHasUnreadNotifications: () => false,
}));

vi.mock('@/shared/ui/AppHeader', () => ({
  AppHeader: () => <header data-testid="app-header" />,
}));

vi.mock('@/shared/ui/EmptyTeamView', () => ({
  EmptyTeamView: () => <div data-testid="empty-team" />,
}));

vi.mock('@/shared/ui/LoadingState', () => ({
  LoadingState: () => <div data-testid="loading" />,
}));

vi.mock('./MapView', () => ({
  MapView: (props: { teamId: number }) => {
    mapViewMock(props);
    return <div data-testid="map-view" />;
  },
}));

const setHomeState = ({
  hasTeam,
  activeTeam,
  isTeamsPending = false,
  isFetching = false,
}: {
  hasTeam: boolean;
  activeTeam?: { teamId: number; teamName: string };
  isTeamsPending?: boolean;
  isFetching?: boolean;
}) => {
  useActiveTeamSelectionMock.mockReturnValue({
    me: { hasTeam },
    activeTeam,
    openTeamSheet: vi.fn(),
    isTeamsPending,
    isFetching,
  });
};

describe('HomePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('팀 보유 플래그가 true여도 실제 활성 팀이 없으면 지도를 렌더링하지 않는다', () => {
    setHomeState({ hasTeam: true });

    render(<HomePage />);

    expect(screen.getByTestId('empty-team')).toBeInTheDocument();
    expect(screen.queryByTestId('map-view')).not.toBeInTheDocument();
    expect(mapViewMock).not.toHaveBeenCalled();
  });

  it('재요청 중이고 활성 팀이 아직 없으면 EmptyTeamView 대신 로딩을 보여준다', () => {
    setHomeState({ hasTeam: true, isFetching: true });

    render(<HomePage />);

    expect(screen.getByTestId('loading')).toBeInTheDocument();
    expect(screen.queryByTestId('empty-team')).not.toBeInTheDocument();
  });

  it('실제 활성 팀이 있을 때만 지도를 렌더링한다', () => {
    setHomeState({ hasTeam: true, activeTeam: { teamId: 7, teamName: '팀' } });

    render(<HomePage />);

    expect(screen.getByTestId('map-view')).toBeInTheDocument();
    expect(mapViewMock).toHaveBeenCalledWith({ teamId: 7 });
  });
});
