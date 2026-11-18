import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { FlappyGamePage } from './FlappyGamePage';

const { press, restart, useFlappyGame, mutate } = vi.hoisted(() => ({
  press: vi.fn(),
  restart: vi.fn(),
  useFlappyGame: vi.fn(),
  mutate: vi.fn(),
}));

vi.mock('../hooks/useFlappyGame', () => ({ useFlappyGame }));
vi.mock('@/shared/hooks/team/useMyTeamMember', () => ({
  useMyTeamMember: () => ({ teamId: 1, teamMemberId: 10 }),
}));
vi.mock('@/shared/api/game/queries', () => ({
  useGameLeaderboard: () => ({ entries: [], isPending: false, isError: false }),
  useSubmitGameScore: () => ({ mutate }),
}));
vi.mock('@/shared/api/game/supabase', () => ({ isGameServerConfigured: true }));

const setStatus = (status: 'ready' | 'playing' | 'over') =>
  useFlappyGame.mockReturnValue({
    canvasRef: { current: null },
    status,
    score: 3,
    press,
    restart,
  });

const renderPage = () =>
  render(
    <MemoryRouter>
      <FlappyGamePage />
    </MemoryRouter>,
  );

const flapButton = () => screen.getByRole('button', { name: /날갯짓하기/ });

describe('FlappyGamePage 입력', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setStatus('ready');
  });

  it('포인터로 누르면 누르는 순간 날갯짓한다', () => {
    renderPage();

    fireEvent.pointerDown(flapButton());

    expect(press).toHaveBeenCalledTimes(1);
  });

  it('회귀: 포인터 없이 키보드(Space·Enter 의 click, detail 0)만으로 시작하고 날갯짓할 수 있다', () => {
    renderPage();

    fireEvent.click(flapButton(), { detail: 0 });
    fireEvent.click(flapButton(), { detail: 0 });

    expect(press).toHaveBeenCalledTimes(2);
  });

  it('터치나 마우스 클릭(detail 1)은 포인터가 처리해서 click으로는 중복 호출하지 않는다', () => {
    renderPage();

    fireEvent.pointerDown(flapButton());
    fireEvent.click(flapButton(), { detail: 1 });

    expect(press).toHaveBeenCalledTimes(1);
  });

  it('날갯짓 버튼은 포커스를 받을 수 있는 button이다', () => {
    renderPage();

    flapButton().focus();

    expect(flapButton()).toHaveFocus();
  });

  it('게임이 끝나면 다시 하기 버튼은 날갯짓 버튼과 별개로 동작한다', () => {
    setStatus('over');
    renderPage();

    fireEvent.click(screen.getByRole('button', { name: '다시 하기' }));

    expect(restart).toHaveBeenCalledTimes(1);
    expect(press).not.toHaveBeenCalled();
  });
});
