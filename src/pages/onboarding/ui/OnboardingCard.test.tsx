import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { OnboardingCard } from './OnboardingCard';

describe('OnboardingCard', () => {
  it('title 과 description 을 렌더링한다', () => {
    render(<OnboardingCard title="MBTI" description="네 글자 성격 유형" />);

    expect(screen.getByText('MBTI')).toBeInTheDocument();
    expect(screen.getByText('네 글자 성격 유형')).toBeInTheDocument();
  });

  it('isSelected 가 true 면 aria-pressed 가 true 이다', () => {
    render(<OnboardingCard title="A" description="B" isSelected />);

    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'true');
  });

  it('isSelected 기본값일 때 aria-pressed 가 활성화되지 않는다', () => {
    render(<OnboardingCard title="A" description="B" />);

    expect(screen.getByRole('button')).not.toHaveAttribute('aria-pressed', 'true');
  });

  it('클릭하면 onClick 핸들러가 호출된다', () => {
    const onClick = vi.fn();
    render(<OnboardingCard title="A" description="B" onClick={onClick} />);

    fireEvent.click(screen.getByRole('button'));

    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
