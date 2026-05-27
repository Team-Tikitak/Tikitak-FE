import { CommentSheet, type CommentSheetItem } from './CommentSheet';
import type { Meta, StoryObj } from '@storybook/react-vite';

const COMMENTS = [
  {
    id: '1',
    authorName: 'name',
    text: 'text',
    avatarSrc: 'https://picsum.photos/seed/comment-avatar-1/80',
    onDelete: () => alert('삭제하기'),
  },
  {
    id: '2',
    authorName: 'name',
    text: 'text',
    avatarSrc: 'https://picsum.photos/seed/comment-avatar-2/80',
  },
] satisfies CommentSheetItem[];

const meta = {
  component: CommentSheet,
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <div className="w-[393px] bg-gray-800 pt-[90px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof CommentSheet>;

export default meta;

type Story = StoryObj<typeof CommentSheet>;

export const Comment: Story = {
  args: {
    comments: COMMENTS,
  },
};

export const CommentUp: Story = {
  args: {
    comments: COMMENTS,
    inputVariant: 'commentup',
  },
};
