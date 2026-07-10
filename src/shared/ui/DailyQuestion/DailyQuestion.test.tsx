import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DailyQuestion } from './DailyQuestion';

class ResizeObserverMock {
  observe = vi.fn();
  disconnect = vi.fn();
}

describe('DailyQuestion', () => {
  beforeEach(() => {
    vi.stubGlobal('ResizeObserver', ResizeObserverMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('renders as disabled when click handler is not provided', () => {
    render(<DailyQuestion question="가장 기억에 남는 순간은?" />);

    const banner = screen.getByRole('button');

    expect(banner).toBeDisabled();
    expect(banner).toHaveClass('bg-[#ff5ca8]');
    expect(screen.queryByRole('img', { name: '오른쪽 화살표' })).not.toBeInTheDocument();
    expect(screen.getByText('가장 기억에 남는 순간은?')).toBeInTheDocument();
  });

  it('calls the click handler and shows the arrow when clickable', () => {
    const onClick = vi.fn();
    render(<DailyQuestion question="오늘 뭐 먹었나요?" onClick={onClick} />);

    fireEvent.click(screen.getByRole('button'));

    expect(onClick).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('button')).toBeEnabled();
  });

  it('uses answered variant while keeping the original question by default', () => {
    render(<DailyQuestion question="친구에게 추천하고 싶은 것은?" variant="answered" />);

    expect(screen.getByRole('button')).toHaveClass('bg-main-001');
    expect(screen.getByText('친구에게 추천하고 싶은 것은?')).toBeInTheDocument();
    expect(screen.queryByText('참여 완료! 친구들의 답변도 확인해 보세요')).not.toBeInTheDocument();
  });

  it('shows the fixed answered message when requested', () => {
    render(
      <DailyQuestion
        question="친구에게 추천하고 싶은 것은?"
        variant="answered"
        showAnsweredMessage
      />,
    );

    expect(screen.getByText('참여 완료! 친구들의 답변도 확인해 보세요')).toBeInTheDocument();
    expect(screen.queryByText('친구에게 추천하고 싶은 것은?')).not.toBeInTheDocument();
  });
});
