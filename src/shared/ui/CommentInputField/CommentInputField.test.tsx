import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { CommentInputField } from './CommentInputField';

describe('CommentInputField', () => {
  it('variant 를 지정하지 않으면 단일 input 만 렌더링한다', () => {
    render(<CommentInputField placeholder="댓글" />);

    expect(screen.getByPlaceholderText('댓글')).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('기본 placeholder 가 적용된다', () => {
    render(<CommentInputField />);

    expect(screen.getByPlaceholderText('댓글을 남겨보세요.')).toBeInTheDocument();
  });

  it('searchbar variant 는 input 옆에 검색 아이콘을 함께 렌더링한다', () => {
    const { container } = render(
      <CommentInputField variant="searchbar" inputProps={{ placeholder: '검색' }} />,
    );

    expect(screen.getByPlaceholderText('검색')).toBeInTheDocument();
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('commentup variant 는 submit 버튼을 함께 렌더링한다', () => {
    render(<CommentInputField variant="commentup" />);

    expect(screen.getByRole('button', { name: '댓글 등록' })).toBeInTheDocument();
  });

  it('commentup variant 의 input 이 disabled 면 submit 버튼도 자동 disabled 된다', () => {
    render(<CommentInputField variant="commentup" inputProps={{ disabled: true }} />);

    expect(screen.getByRole('button', { name: '댓글 등록' })).toBeDisabled();
  });

  it('commentup submit 버튼 클릭이 핸들러로 전달된다', () => {
    const onClick = vi.fn();
    render(<CommentInputField variant="commentup" submitButtonProps={{ onClick }} />);

    fireEvent.click(screen.getByRole('button', { name: '댓글 등록' }));

    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
