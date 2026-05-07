import TakBuilder from '@/shared/assets/Character/TakBuilder.svg';
import { Avatar } from './Avatar';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  component: Avatar,
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof Avatar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Sm: Story = {
  args: {
    src: TakBuilder,
    alt: 'TakBuilder',
    size: 'sm',
  },
};

export const Md: Story = {
  args: {
    src: TakBuilder,
    alt: 'TakBuilder',
    size: 'md',
  },
};

export const Lg: Story = {
  args: {
    src: TakBuilder,
    alt: 'TakBuilder',
    size: 'lg',
  },
};
