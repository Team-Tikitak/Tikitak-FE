import { Chip } from './Chip';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Shared/UI/Chip',
  component: Chip,
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof Chip>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: '카페',
  },
};

export const LongLabel: Story = {
  args: {
    children: '아주 긴 라벨 텍스트가 들어간 경우',
  },
};
