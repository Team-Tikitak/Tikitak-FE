import MoreIcon from '@/shared/assets/Icon/MoreIcon.svg?react';
import { ActiveMenu } from './ActiveMenu';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta<typeof ActiveMenu> = {
  component: ActiveMenu,
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <div className="flex items-start justify-end bg-gray-100 p-10">
        <Story />
      </div>
    ),
  ],
  args: {
    onDelete: () => alert('삭제하기 클릭'),
    onEdit: () => alert('수정하기 클릭'),
  },
};

export default meta;
type Story = StoryObj<typeof ActiveMenu>;

export const Horizontal: Story = {
  args: {
    icon: <MoreIcon className="size-4" />,
  },
};

export const Vertical: Story = {
  args: {
    icon: <MoreIcon className="size-4 rotate-90" />,
  },
};

export const DeleteOnly: Story = {
  args: {
    icon: <MoreIcon className="size-4" />,
    onEdit: undefined,
  },
};
