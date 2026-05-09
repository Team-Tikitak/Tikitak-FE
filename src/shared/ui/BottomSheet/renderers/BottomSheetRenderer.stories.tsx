import { BottomSheetRenderer } from './BottomSheetRenderer';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  component: BottomSheetRenderer,
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
} satisfies Meta<typeof BottomSheetRenderer>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Comment: Story = {
  args: {
    type: 'comment',
    comments: [
      {
        id: '1',
        authorName: 'name',
        text: 'text',
        avatarSrc: 'https://picsum.photos/seed/comment-renderer-1/80',
      },
      {
        id: '2',
        authorName: 'name',
        text: 'text',
        avatarSrc: 'https://picsum.photos/seed/comment-renderer-2/80',
      },
    ],
  },
};
