import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PATHS } from '@/app/routes/paths';
import { MonthlyMemories } from './MonthlyMemories';

const mockNavigate = vi.fn();
const mockUseHomeEveryonePick = vi.fn();
const mockUseHomeRegions = vi.fn();

vi.mock('react-router', () => ({
  useNavigate: () => mockNavigate,
}));

vi.mock('@/shared/api/home/queries', () => ({
  useHomeEveryonePick: (teamId: number | null | undefined) => mockUseHomeEveryonePick(teamId),
  useHomeRegions: (teamId: number | null | undefined) => mockUseHomeRegions(teamId),
}));

vi.mock('@/shared/assets/Character/TakBuilder.svg?react', () => ({
  default: (props: React.ComponentProps<'svg'>) => <svg {...props} />,
}));

describe('MonthlyMemories', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    mockUseHomeEveryonePick.mockReturnValue({
      data: {
        month: 7,
        picks: [{ feedId: 1, thumbnailImageUrl: 'https://example.com/pick.jpg' }],
      },
      isPending: false,
    });
    mockUseHomeRegions.mockReturnValue({
      data: {
        month: 7,
        regions: [
          {
            region: '서울',
            feedCount: 1,
            feedId: 145,
            thumbnailImageUrl: 'https://example.com/seoul.jpg',
          },
        ],
      },
      isPending: false,
    });
  });

  it('모두의 PICK 카드를 누르면 모두의 PICK 목록으로 이동한다', () => {
    render(<MonthlyMemories teamId={1} />);

    fireEvent.click(screen.getByRole('button', { name: '모두의 PICK' }));

    expect(mockNavigate).toHaveBeenCalledWith(PATHS.ACTIVITY_EVERYONE_PICK);
  });

  it('지역 카드를 누르면 지역별 피드 목록으로 이동한다', () => {
    render(<MonthlyMemories teamId={1} />);

    fireEvent.click(screen.getByRole('button', { name: '서울에서' }));

    expect(mockNavigate).toHaveBeenCalledWith(PATHS.ACTIVITY_REGION_FEEDS);
  });
});
