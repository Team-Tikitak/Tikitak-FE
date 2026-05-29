import { LoadingState } from './LoadingState';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Shared/UI/LoadingState',
  component: LoadingState,
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof LoadingState>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Page: Story = {
  args: { variant: 'page' },
};

export const Inline: Story = {
  args: { variant: 'inline' },
};

export const Fullscreen: Story = {
  args: { variant: 'fullscreen' },
  decorators: [
    (Story) => (
      <div className="h-dvh w-[393px]">
        <Story />
      </div>
    ),
  ],
};
