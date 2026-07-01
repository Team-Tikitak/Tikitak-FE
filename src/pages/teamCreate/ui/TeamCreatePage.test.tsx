import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PATHS } from '@/app/routes/paths';
import { TeamCreatePage } from './TeamCreatePage';
import type { ReactNode } from 'react';

const { keyboardVisibleMock, navigateMock, useTeamCreateFormMock } = vi.hoisted(() => ({
  keyboardVisibleMock: vi.fn(),
  navigateMock: vi.fn(),
  useTeamCreateFormMock: vi.fn(),
}));

vi.mock('react-router', () => ({
  useLocation: () => ({ state: null }),
  useNavigate: () => navigateMock,
}));

vi.mock('@/app/layout', () => ({
  PageShell: ({
    header,
    children,
    bottom,
  }: {
    header: ReactNode;
    children: ReactNode;
    bottom?: ReactNode;
  }) => (
    <div>
      {header}
      {children}
      <div data-testid="bottom">{bottom}</div>
    </div>
  ),
}));

vi.mock('@/shared/hooks/useEdgeSwipeBack', () => ({
  useEdgeSwipeBack: vi.fn(),
}));

vi.mock('@/shared/hooks/useKeyboardVisible', () => ({
  useKeyboardVisible: () => keyboardVisibleMock(),
}));

vi.mock('../hooks/useTeamCreateForm', () => ({
  useTeamCreateForm: (...args: unknown[]) => useTeamCreateFormMock(...args),
}));

describe('TeamCreatePage', () => {
  beforeEach(() => {
    navigateMock.mockReset();
    keyboardVisibleMock.mockReturnValue(false);
    useTeamCreateFormMock.mockReturnValue({
      name: '팀 이름',
      setName: vi.fn(),
      description: '팀 소개',
      setDescription: vi.fn(),
      isDisabled: false,
      draft: { name: '팀 이름', description: '팀 소개' },
    });
  });

  it('shows the complete button and navigates with the draft while the keyboard is hidden', () => {
    render(<TeamCreatePage />);

    const completeButton = screen.getByTestId('bottom').querySelector('button');
    expect(completeButton).toBeInTheDocument();
    fireEvent.click(completeButton as HTMLButtonElement);

    expect(navigateMock).toHaveBeenCalledWith(PATHS.TEAM_PROFILE_SETUP, {
      state: { name: '팀 이름', description: '팀 소개', mode: 'create' },
    });
  });

  it('hides the complete button while the keyboard is visible', () => {
    keyboardVisibleMock.mockReturnValue(true);

    render(<TeamCreatePage />);

    expect(screen.getByTestId('bottom').querySelector('button')).not.toBeInTheDocument();
  });
});
