import { createEvent, fireEvent, render, screen } from '@testing-library/react';
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

  it('이동하기 전에 현재 활동 스크롤 위치를 저장할 수 있게 알린다', () => {
    const onBeforeNavigate = vi.fn();
    render(<MonthlyMemories teamId={1} onBeforeNavigate={onBeforeNavigate} />);

    fireEvent.click(screen.getByRole('button', { name: '모두의 PICK' }));

    expect(onBeforeNavigate).toHaveBeenCalledTimes(1);
    const [beforeNavigateOrder] = onBeforeNavigate.mock.invocationCallOrder;
    const [navigateOrder] = mockNavigate.mock.invocationCallOrder;
    expect(beforeNavigateOrder).toBeLessThan(navigateOrder);
  });

  it('카드를 키보드로 활성화하면 이동하고 기본 스크롤을 막는다', () => {
    render(<MonthlyMemories teamId={1} />);

    const card = screen.getByRole('button', { name: '모두의 PICK' });
    const event = createEvent.keyDown(card, { key: ' ' });
    const preventDefault = vi.spyOn(event, 'preventDefault');
    fireEvent(card, event);

    expect(preventDefault).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith(PATHS.ACTIVITY_EVERYONE_PICK);
  });

  it('카드를 터치만 한 상태에서는 이동하지 않는다', () => {
    render(<MonthlyMemories teamId={1} />);

    fireEvent.pointerDown(screen.getByRole('button', { name: '모두의 PICK' }));

    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('회귀: 카드 이미지에 히어로 전환용 속성을 붙이지 않는다', () => {
    const { container } = render(<MonthlyMemories teamId={1} />);

    for (const image of container.querySelectorAll('img')) {
      expect(image).not.toHaveAttribute('data-hero-exit-key');
      expect(image).not.toHaveAttribute('data-hero-radius');
    }
  });
});
