import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { QuestionStep } from './QuestionStep';
import type { Question } from '../model/types';

const QUESTION_Q1: Question = {
  id: 'q1',
  title: '질문 1',
  subtitle: '서브타이틀',
  options: [
    { id: 'a', title: '선택지 A', description: 'A 설명' },
    { id: 'b', title: '선택지 B', description: 'B 설명' },
  ],
};

describe('QuestionStep', () => {
  it('질문 제목·서브타이틀·옵션 카드를 렌더링한다', () => {
    render(<QuestionStep question={QUESTION_Q1} onBack={vi.fn()} onSelect={vi.fn()} />);

    expect(screen.getByRole('heading', { name: '질문 1' })).toBeInTheDocument();
    expect(screen.getByText('서브타이틀')).toBeInTheDocument();
    expect(screen.getByText('선택지 A')).toBeInTheDocument();
    expect(screen.getByText('선택지 B')).toBeInTheDocument();
  });

  it('selectedOptionId 와 일치하는 카드만 aria-pressed 가 true 이다', () => {
    render(
      <QuestionStep
        question={QUESTION_Q1}
        selectedOptionId="a"
        onBack={vi.fn()}
        onSelect={vi.fn()}
      />,
    );

    const cards = screen.getAllByRole('button', { name: /선택지/ });
    expect(cards[0]).toHaveAttribute('aria-pressed', 'true');
    expect(cards[1]).not.toHaveAttribute('aria-pressed', 'true');
  });

  it('옵션 카드를 클릭하면 onSelect 가 해당 id 로 호출된다', () => {
    const onSelect = vi.fn();
    render(<QuestionStep question={QUESTION_Q1} onBack={vi.fn()} onSelect={onSelect} />);

    fireEvent.click(screen.getByRole('button', { name: /선택지 B/ }));

    expect(onSelect).toHaveBeenCalledWith('b');
  });

  it('뒤로가기 버튼 클릭 시 onBack 이 호출된다', () => {
    const onBack = vi.fn();
    render(<QuestionStep question={QUESTION_Q1} onBack={onBack} onSelect={vi.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: '뒤로 가기' }));

    expect(onBack).toHaveBeenCalledTimes(1);
  });
});
