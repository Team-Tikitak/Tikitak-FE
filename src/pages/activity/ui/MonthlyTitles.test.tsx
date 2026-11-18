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
    useGameLeaderboard.mockReturnValue({ entries: [], isPending: true });

    render(<MonthlyTitles teamId={1} />);

    expect(screen.getByText('출석왕')).toBeInTheDocument();
    expect(screen.queryByText('이달의 게임왕')).not.toBeInTheDocument();
  });

  it('게임 순위표가 도착하면 게임왕이 함께 보인다', () => {
    useGameLeaderboard.mockReturnValue({ entries: [entry(1)], isPending: false });

    render(<MonthlyTitles teamId={1} />);

    expect(screen.getByText('출석왕')).toBeInTheDocument();
    expect(screen.getByText('이달의 게임왕')).toBeInTheDocument();
  });
});
