import { BottomSheet } from './BottomSheet';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  component: BottomSheet,
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <div className="w-[393px] bg-gray-800 pt-10">
        <Story />
      </div>
    ),
  ],
  args: {
    title: '제목',
    className: 'h-[294px]',
    children: <div className="body-1 text-gray-700">내용</div>,
  },
} satisfies Meta<typeof BottomSheet>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
