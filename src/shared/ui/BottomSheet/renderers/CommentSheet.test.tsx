import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { CommentSheet, type CommentSheetItem } from './CommentSheet';

describe('CommentSheet', () => {
  const mockComments: CommentSheetItem[] = [
    {
      id: '1',
      authorName: 'John',
      text: 'Great post!',
      avatarSrc: 'https://example.com/john.jpg',
    },
  ];

  it('should render comments', () => {
    render(<CommentSheet comments={mockComments} onSubmitComment={vi.fn()} />);

    expect(screen.getByText('John')).toBeInTheDocument();
    expect(screen.getByText('Great post!')).toBeInTheDocument();
  });

  it('should apply correct className when fitHeight is false', () => {
    const { container } = render(<CommentSheet comments={mockComments} fitHeight={false} />);

    const bottomSheet = container.querySelector('.comment-bottom-sheet-base');
    expect(bottomSheet).toBeInTheDocument();
  });

  it('should apply correct className when fitHeight is true', () => {
    const { container } = render(<CommentSheet comments={mockComments} fitHeight={true} />);

    const sheet = container.querySelector('.h-full');
    expect(sheet).toBeInTheDocument();
    expect(sheet?.className).toContain('pb-[env(safe-area-inset-bottom)]');
  });

  it('should render with commentup input variant', () => {
    render(
      <CommentSheet comments={mockComments} inputVariant="commentup" onSubmitComment={vi.fn()} />,
    );

    const input = screen.getByRole('textbox');
    expect(input).toBeInTheDocument();
  });

  it('renders commentup input in a fixed bottom layer', () => {
    const { container } = render(
      <CommentSheet comments={mockComments} inputVariant="commentup" onSubmitComment={vi.fn()} />,
    );

    expect(screen.getByTestId('fixed-comment-input')).toHaveClass(
      'fixed',
      'bottom-(--keyboard-height)',
    );
    expect(container.querySelector('.no-scrollbar')).toHaveClass(
      'pb-[calc(88px+env(safe-area-inset-bottom))]',
    );
  });

  it('should not exceed max comment length', async () => {
    const user = userEvent.setup();
    const MAX_COMMENT_LENGTH = 500; // 실제 값은 constants에서 가져옴

    render(
      <CommentSheet comments={mockComments} inputVariant="commentup" onSubmitComment={vi.fn()} />,
    );

    const input = screen.getByRole('textbox') as HTMLInputElement;
    const longText = 'a'.repeat(600);

    await user.type(input, longText);

    expect(input.value.length).toBeLessThanOrEqual(MAX_COMMENT_LENGTH);
  });

  it('should display my comment with delete menu', () => {
    const myComment: CommentSheetItem = {
      id: '1',
      authorName: 'Me',
      text: 'My comment',
      avatarSrc: 'https://example.com/me.jpg',
      isMine: true,
      onDelete: vi.fn(),
    };

    render(<CommentSheet comments={[myComment]} onDeleteRequest={vi.fn()} />);

    expect(screen.getByText('Me')).toBeInTheDocument();
    // 더보기 버튼이 있어야 함
    expect(screen.getByRole('button', { name: /더보기|더 많은 옵션|옵션/i })).toBeInTheDocument();
  });

  it('should render empty state with no comments', () => {
    const { container } = render(<CommentSheet comments={[]} />);

    const commentList = container.querySelector('.no-scrollbar');
    expect(commentList?.children.length).toBe(0);
  });
});
