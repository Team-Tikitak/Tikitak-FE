import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { TermsCheckRow } from './TermsCheckRow';

describe('TermsCheckRow', () => {
  it('variant all 은 라벨과 토글 버튼을 렌더링하고 클릭 시 onToggle 을 호출한다', () => {
    const onToggle = vi.fn();
    render(<TermsCheckRow variant="all" checked={false} label="전체동의" onToggle={onToggle} />);

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByText('전체동의')).toBeInTheDocument();

    fireEvent.click(button);
    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it('checked 가 true 이면 aria-pressed 가 true 이다', () => {
    render(<TermsCheckRow variant="all" checked label="전체동의" onToggle={vi.fn()} />);

    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'true');
  });

  it('variant item 에 onDetailClick 가 없으면 상세보기 버튼이 없다', () => {
    render(
      <TermsCheckRow variant="item" checked={false} label="서비스 이용약관" onToggle={vi.fn()} />,
    );

    expect(screen.queryByLabelText(/자세히 보기/)).not.toBeInTheDocument();
  });

  it('variant item 에 onDetailClick 가 있으면 상세보기 버튼이 함께 렌더링된다', () => {
    const onDetailClick = vi.fn();
    render(
      <TermsCheckRow
        variant="item"
        checked={false}
        label="서비스 이용약관"
        onToggle={vi.fn()}
        onDetailClick={onDetailClick}
      />,
    );

    fireEvent.click(screen.getByLabelText('서비스 이용약관 자세히 보기'));

    expect(onDetailClick).toHaveBeenCalledTimes(1);
  });

  it('variant item 의 토글 버튼 클릭은 onToggle 만 호출한다', () => {
    const onToggle = vi.fn();
    const onDetailClick = vi.fn();
    render(
      <TermsCheckRow
        variant="item"
        checked={false}
        label="서비스 이용약관"
        onToggle={onToggle}
        onDetailClick={onDetailClick}
      />,
    );

    fireEvent.click(screen.getByRole('button', { pressed: false }));

    expect(onToggle).toHaveBeenCalledTimes(1);
    expect(onDetailClick).not.toHaveBeenCalled();
  });
});
