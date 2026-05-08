import { FloatingButton } from './FloatingButton';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  component: FloatingButton,
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <div className="flex h-[180px] w-[180px] items-center justify-center bg-[#303030]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof FloatingButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
