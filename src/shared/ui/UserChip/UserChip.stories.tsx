import { UserChip } from './UserChip';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta<typeof UserChip> = {
  component: UserChip,
  parameters: { layout: 'centered' },
};

export default meta;
type Story = StoryObj<typeof UserChip>;

export const Md: Story = {
  args: {
    name: '홍길동',
    avatarSrc: 'https://i.pravatar.cc/24',
    size: 'md',
  },
};

export const Sm: Story = {
  args: {
    name: '홍길동',
    avatarSrc: 'https://i.pravatar.cc/24',
    size: 'sm',
  },
};

export const SmSelected: Story = {
  args: {
    name: '홍길동',
    avatarSrc: 'https://i.pravatar.cc/24',
    size: 'sm',
    selected: true,
  },
};

export const SmallAdd: Story = {
  args: {
    name: '홍길동',
    avatarSrc: 'https://i.pravatar.cc/24',
    size: 'sm',
    onRemove: () => {},
  },
};

export const WithoutAvatar: Story = {
  args: {
    name: '홍길동',
  },
};
