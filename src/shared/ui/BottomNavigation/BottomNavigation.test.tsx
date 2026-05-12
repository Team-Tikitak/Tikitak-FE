import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { BottomNavigation } from './BottomNavigation';

describe('BottomNavigation', () => {
  it('home, feed, my 세 개의 탭과 추가 버튼을 렌더링한다', () => {
    render(<BottomNavigation />);

    expect(screen.getByRole('button', { name: /홈/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /피드/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /마이/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '추가' })).toBeInTheDocument();
  });

  it('activeTab 에 해당하는 항목만 aria-current 가 page 이다', () => {
    render(<BottomNavigation activeTab="feed" />);

    expect(screen.getByRole('button', { name: /피드/ })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('button', { name: /홈/ })).not.toHaveAttribute('aria-current');
    expect(screen.getByRole('button', { name: /마이/ })).not.toHaveAttribute('aria-current');
  });

  it('탭 클릭 시 onTabChange 가 해당 값으로 호출된다', () => {
    const onTabChange = vi.fn();
    render(<BottomNavigation onTabChange={onTabChange} />);

    fireEvent.click(screen.getByRole('button', { name: /마이/ }));

    expect(onTabChange).toHaveBeenCalledWith('my');
  });

  it('floating 추가 버튼 클릭 시 onCreateClick 이 호출된다', () => {
    const onCreateClick = vi.fn();
    render(<BottomNavigation onCreateClick={onCreateClick} />);

    fireEvent.click(screen.getByRole('button', { name: '추가' }));

    expect(onCreateClick).toHaveBeenCalledTimes(1);
  });

  it('createAriaLabel 로 추가 버튼의 aria-label 을 바꿀 수 있다', () => {
    render(<BottomNavigation createAriaLabel="모임 생성" />);

    expect(screen.getByRole('button', { name: '모임 생성' })).toBeInTheDocument();
  });
});
