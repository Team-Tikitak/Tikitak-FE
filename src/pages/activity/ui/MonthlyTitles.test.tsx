import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MonthlyTitles } from './MonthlyTitles';

const { useGameLeaderboard } = vi.hoisted(() => ({ useGameLeaderboard: vi.fn() }));

vi.mock('@/shared/api/game/queries', () => ({ useGameLeaderboard }));
vi.mock('@/shared/api/home/queries', () => ({
  useHomeBestAttendance: () => ({
    data: {
      month: 11,
      members: [{ rank: 1, teamMemberId: 1, nickname: '경준', profileImgUrl: '', tagCount: 7 }],
    },
    isPending: false,
  }),
  useHomeCombinations: () => ({
    data: { month: 11, combination: [], feeds: [] },
    isPending: false,
  }),
  useHomeRegions: () => ({ data: { month: 11, regions: [] }, isPending: false }),
}));

const entry = (rank: number) => ({
  rank,
  teamMemberId: 1,
  nickname: '경준',
  profileImgUrl: '',
  score: 10,
});

describe('MonthlyTitles', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('게임 순위표가 아직 오지 않아도 기존 칭호를 먼저 보여준다', () => {
    useGameLeaderboard.mockReturnValue({ entries: [], isPending: true, isError: false });

    render(<MonthlyTitles teamId={1} />);

    expect(screen.getByText('출석왕')).toBeInTheDocument();
    expect(screen.queryByText('이달의 게임왕')).not.toBeInTheDocument();
  });

  it('게임 순위표가 도착하면 게임왕이 함께 보인다', () => {
    useGameLeaderboard.mockReturnValue({ entries: [entry(1)], isPending: false, isError: false });

    render(<MonthlyTitles teamId={1} />);

    expect(screen.getByText('출석왕')).toBeInTheDocument();
    expect(screen.getByText('이달의 게임왕')).toBeInTheDocument();
  });

  it('회귀: 한 게임의 조회가 실패하면 나머지 순위표만으로 게임왕을 정하지 않는다', () => {
    // 경준은 모든 게임에서 1위라 정상이면 게임왕이지만, 한 게임이 실패하면 계산하지 않는다
    const board = (isError: boolean) => ({
      entries: isError ? [] : [entry(1)],
      isPending: false,
      isError,
    });
    useGameLeaderboard
      .mockReturnValueOnce(board(false))
      .mockReturnValueOnce(board(true))
      .mockReturnValueOnce(board(false));

    render(<MonthlyTitles teamId={1} />);

    expect(screen.getByText('출석왕')).toBeInTheDocument();
    expect(screen.queryByText('이달의 게임왕')).not.toBeInTheDocument();
  });

  it('회귀: 기록이 없는 정상 순위표와 조회 실패를 구분한다', () => {
    useGameLeaderboard.mockReturnValue({ entries: [], isPending: false, isError: false });

    render(<MonthlyTitles teamId={1} />);

    // 정상적으로 비어 있으면 게임왕이 없을 뿐이고 기존 칭호는 그대로 보인다
    expect(screen.getByText('출석왕')).toBeInTheDocument();
    expect(screen.queryByText('이달의 게임왕')).not.toBeInTheDocument();
  });
});
