import { Check } from './Check';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Shared/UI/Check',
  component: Check,
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof Check>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Checked: Story = {
  args: {
    checked: true,
  },
};

export const Unchecked: Story = {
  args: {
    checked: false,
  },
};
