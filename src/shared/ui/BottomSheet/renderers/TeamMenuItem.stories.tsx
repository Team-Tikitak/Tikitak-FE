import { TeamMenuItem } from './TeamMenuItem';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  component: TeamMenuItem,
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <div className="w-[350px] bg-white">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof TeamMenuItem>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Selected: Story = {
  args: {
    title: '캡스톤 디자인 아자잣',
    description: '새로운 게시글 +23',
    selected: true,
  },
};

export const Unselected: Story = {
  args: {
    title: '캡스톤 디자인 아자잣',
    description: '새로운 게시글 +23',
    selected: false,
  },
};
