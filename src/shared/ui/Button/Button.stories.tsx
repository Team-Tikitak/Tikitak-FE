import PlusIcon from '@/shared/assets/Icon/PlusIcon.svg?react';
import { Button } from './Button';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Shared/UI/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <div className="w-[353px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Button>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    variant: 'default',
    children: '팀 개설하기',
    buttonIcon: <PlusIcon />,
  },
};

export const DefaultTap: Story = {
  args: {
    variant: 'default',
    children: '팀 개설하기',
    buttonIcon: <PlusIcon />,
    className: 'border-none bg-gray-300 text-gray-700',
  },
};

export const Primary: Story = {
  args: {
    variant: 'primary',
    children: '시작하기',
  },
};

export const PrimaryDisabled: Story = {
  args: {
    variant: 'primary',
    children: '시작하기',
    disabled: true,
  },
};

export const Destructive: Story = {
  args: {
    variant: 'destructive',
    children: '그룹 삭제',
  },
};
