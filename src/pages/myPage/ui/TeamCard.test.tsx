import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { TeamCard } from './TeamCard';

describe('TeamCard', () => {
  it('클릭 가능한 카드를 키보드로 활성화한다', () => {
    const onClick = vi.fn();
    render(<TeamCard teamName="티키타카" memberCount={3} users={[]} onClick={onClick} />);

    const card = screen.getByRole('button', { name: /티키타카/ });
    fireEvent.keyDown(card, { key: 'Enter' });
    fireEvent.keyDown(card, { key: ' ' });

    expect(card).toHaveClass('motion-safe:press-feedback');
    expect(onClick).toHaveBeenCalledTimes(2);
  });
});
