import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Header } from './Header';

describe('Header', () => {
  it('title 을 heading 으로 렌더링한다', () => {
    render(<Header title="팀 초대" />);

    expect(screen.getByRole('heading', { name: '팀 초대' })).toBeInTheDocument();
  });

  it('variant center 의 기본 동작은 뒤로가기 버튼 노출이다', () => {
    const onBack = vi.fn();
    render(<Header title="제목" onBack={onBack} />);

    fireEvent.click(screen.getByRole('button', { name: '뒤로 가기' }));

    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it('variant center 에서 showBackButton 이 false 면 뒤로가기 버튼이 없다', () => {
    render(<Header title="제목" showBackButton={false} />);

    expect(screen.queryByRole('button', { name: '뒤로 가기' })).not.toBeInTheDocument();
  });

  it('variant left 는 뒤로가기 버튼이 없고 기본 우측 검색 아이콘이 있다', () => {
    render(<Header variant="left" title="제목" />);

    expect(screen.queryByRole('button', { name: '뒤로 가기' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: '검색' })).toBeInTheDocument();
  });

  it('rightIcon 을 명시하면 우측 버튼 클릭이 onRightClick 으로 전달된다', () => {
    const onRightClick = vi.fn();
    render(
      <Header
        title="제목"
        rightIcon={<span data-testid="custom-icon" />}
        rightAriaLabel="사용자 설정"
        onRightClick={onRightClick}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: '사용자 설정' }));

    expect(onRightClick).toHaveBeenCalledTimes(1);
  });
});
