import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PATHS } from '@/app/routes/paths';
import { BottomNavigation } from './BottomNavigation';
import type * as ReactRouter from 'react-router';

const navigateMock = vi.fn();

vi.mock('react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof ReactRouter>();
  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

describe('BottomNavigation', () => {
  beforeEach(() => {
    navigateMock.mockClear();
  });

  it('home, feed, activity, my 탭과 추가 버튼을 렌더링한다', () => {
    render(<BottomNavigation />);

    expect(screen.getByRole('button', { name: /홈/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /피드/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /활동/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /마이/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '추가' })).toBeInTheDocument();
  });

  it('Figma 기준 좌우 20px, 중앙 80px gap 레이아웃을 유지한다', () => {
    render(<BottomNavigation />);

    const navigation = screen.getByRole('navigation', { name: '하단 내비게이션' });
    const list = navigation.querySelector('ul');

    expect(navigation).toHaveClass('h-[calc(88px+env(safe-area-inset-bottom))]');
    expect(list).toHaveClass(
      'h-[calc(60px+env(safe-area-inset-bottom))]',
      'bottom-0',
      'pb-[calc(8px+env(safe-area-inset-bottom))]',
    );
    expect(list).toHaveClass('px-5');
    expect(list).toHaveClass(
      'grid-cols-[minmax(0,1fr)_minmax(0,1fr)_80px_minmax(0,1fr)_minmax(0,1fr)]',
    );
    expect(screen.getByRole('button', { name: '추가' })).toHaveClass(
      'left-1/2',
      '-translate-x-1/2',
      'top-0',
    );
    expect(screen.getByRole('button', { name: '추가' }).className).not.toContain('translate-y');
    expect(screen.getByRole('button', { name: '추가' }).className).not.toContain('active:scale');
    expect(screen.getByRole('button', { name: '추가' }).querySelector('span')).toHaveClass(
      'group-active:scale-[0.97]',
    );
  });

  it('탭 버튼은 누름 피드백으로 위치가 흔들리지 않는다', () => {
    render(<BottomNavigation />);

    for (const label of ['홈', '피드', '활동', '마이']) {
      const button = screen.getByRole('button', { name: label });
      expect(button.className).not.toContain('press-feedback');
      expect(button.className).not.toContain('active:scale');
      expect(button.className).not.toContain('translate');
      expect(button.querySelector('span')).toHaveClass('h-full', 'w-full');
      expect(button.querySelector('[data-bottom-navigation-icon-frame]')).toHaveClass('size-6');
      expect(button.querySelector('svg')).toHaveClass('origin-center', 'group-active:scale-[0.98]');
      expect(button.querySelector('svg')?.className).not.toContain('translate-x');
    }
  });

  it('피드와 활동 아이콘은 프레임만 왼쪽으로 미세 보정한다', () => {
    render(<BottomNavigation />);

    expect(
      screen
        .getByRole('button', { name: '피드' })
        .querySelector('[data-bottom-navigation-icon-frame]'),
    ).toHaveClass('-translate-x-[0.3px]');
    expect(
      screen
        .getByRole('button', { name: '활동' })
        .querySelector('[data-bottom-navigation-icon-frame]'),
    ).toHaveClass('-translate-x-[0.3px]');
  });

  it('activeTab 에 해당하는 항목만 aria-current 가 page 이다', () => {
    render(<BottomNavigation activeTab="feed" />);

    expect(screen.getByRole('button', { name: /피드/ })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('button', { name: /홈/ })).not.toHaveAttribute('aria-current');
    expect(screen.getByRole('button', { name: /마이/ })).not.toHaveAttribute('aria-current');
  });

  it('마이 탭 클릭 시 MY_PAGE 로 navigate 한다', () => {
    render(<BottomNavigation />);

    fireEvent.click(screen.getByRole('button', { name: /마이/ }));

    expect(navigateMock).toHaveBeenCalledWith(PATHS.MY_PAGE);
  });

  it('홈 탭 클릭 시 HOME 으로 navigate 한다', () => {
    render(<BottomNavigation />);

    fireEvent.click(screen.getByRole('button', { name: /홈/ }));

    expect(navigateMock).toHaveBeenCalledWith(PATHS.HOME);
  });

  it('floating 추가 버튼 클릭 시 onCreateClick 이 호출된다', () => {
    const onCreateClick = vi.fn();
    render(<BottomNavigation onCreateClick={onCreateClick} />);

    fireEvent.click(screen.getByRole('button', { name: '추가' }));

    expect(onCreateClick).toHaveBeenCalledTimes(1);
  });

  it('비활성 상태에서는 floating 추가 버튼이 포인터 이벤트를 받지 않는다', () => {
    render(<BottomNavigation interactive={false} />);

    expect(screen.getByRole('button', { name: '추가' })).toHaveClass('pointer-events-none');
  });

  it('createAriaLabel 로 추가 버튼의 aria-label 을 바꿀 수 있다', () => {
    render(<BottomNavigation createAriaLabel="모임 생성" />);

    expect(screen.getByRole('button', { name: '모임 생성' })).toBeInTheDocument();
  });
});
