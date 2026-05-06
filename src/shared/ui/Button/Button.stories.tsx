import PlusIcon from '@/shared/assets/Icon/PlusIcon.svg?react';
import { Button } from './Button';
import type { StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Shared/UI/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    variant: 'default',
    children: '팀 개설하기',
    buttonIcon: <PlusIcon />,
  },
};

export const Destructive: Story = {
  args: {
    variant: 'destructive',
    children: '그룹 삭제',
  },
};
