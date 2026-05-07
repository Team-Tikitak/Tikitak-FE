import { Header } from './Header';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta<typeof Header> = {
  component: Header,
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <div className="w-[393px] bg-white">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Header>;

export const Center: Story = {
  args: {
    title: '망원역',
    variant: 'center',
  },
};

export const Left: Story = {
  args: {
    title: '피드',
    variant: 'left',
  },
};

export const CenterWithoutBackButton: Story = {
  args: {
    title: '망원역',
    variant: 'center',
    showBackButton: false,
  },
};
