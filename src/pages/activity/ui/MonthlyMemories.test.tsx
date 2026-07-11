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

  it('PICK 카드를 누르면 히어로 캡처 콜백이 올바른 정보로 호출된다', () => {
    const onHeroCapture = vi.fn();
    render(<MonthlyMemories teamId={1} onHeroCapture={onHeroCapture} />);

    fireEvent.click(screen.getByRole('button', { name: '모두의 PICK' }));

    expect(onHeroCapture).toHaveBeenCalledWith(
      {
        id: '1',
        heroKey: 'pin-1',
        thumbnailUrl: 'https://example.com/pick.jpg',
      },
      expect.any(HTMLElement),
    );
  });

  it('PICK 카드를 키보드로 활성화하면 히어로 캡처 후 이동하고 기본 스크롤을 막는다', () => {
    const onHeroCapture = vi.fn();
    render(<MonthlyMemories teamId={1} onHeroCapture={onHeroCapture} />);

    const card = screen.getByRole('button', { name: '모두의 PICK' });
    const event = createEvent.keyDown(card, { key: ' ' });
    const preventDefault = vi.spyOn(event, 'preventDefault');
    fireEvent(card, event);

    expect(preventDefault).toHaveBeenCalledTimes(1);
    expect(onHeroCapture).toHaveBeenCalledWith(
      {
        id: '1',
        heroKey: 'pin-1',
        thumbnailUrl: 'https://example.com/pick.jpg',
      },
      expect.any(HTMLElement),
    );
    expect(mockNavigate).toHaveBeenCalledWith(PATHS.ACTIVITY_EVERYONE_PICK);
  });

  it('지역 카드를 누르면 히어로 캡처 콜백이 올바른 정보로 호출된다', () => {
    const onHeroCapture = vi.fn();
    render(<MonthlyMemories teamId={1} onHeroCapture={onHeroCapture} />);

    fireEvent.click(screen.getByRole('button', { name: '서울에서' }));

    expect(onHeroCapture).toHaveBeenCalledWith(
      {
        id: '145',
        heroKey: 'pin-145',
        thumbnailUrl: 'https://example.com/seoul.jpg',
      },
      expect.any(HTMLElement),
    );
  });

  it('카드를 터치만 한 상태에서는 히어로 캡처를 시작하지 않는다', () => {
    const onHeroCapture = vi.fn();
    render(<MonthlyMemories teamId={1} onHeroCapture={onHeroCapture} />);

    fireEvent.pointerDown(screen.getByRole('button', { name: '모두의 PICK' }));

    expect(onHeroCapture).not.toHaveBeenCalled();
  });

  it('suppressedItemId가 PICK 카드의 feedId와 일치하면 그 카드의 이미지만 숨긴다', () => {
    const { container } = render(<MonthlyMemories teamId={1} suppressedItemId="1" />);

    const images = container.querySelectorAll('img');
    const pickImage = Array.from(images).find((img) => img.src.includes('pick.jpg'));
    const regionImage = Array.from(images).find((img) => img.src.includes('seoul.jpg'));

    expect(pickImage).toHaveClass('opacity-0');
    expect(pickImage).not.toHaveAttribute('data-hero-exit-key');
    expect(regionImage).not.toHaveClass('opacity-0');
    expect(regionImage).toHaveAttribute('data-hero-exit-key', 'pin-145');
  });
});
