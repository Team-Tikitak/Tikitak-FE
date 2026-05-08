import { BottomNavigation } from './BottomNavigation';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta<typeof BottomNavigation> = {
  component: BottomNavigation,
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <div className="flex min-h-[300px] w-[393px] flex-col items-center justify-center gap-10 bg-[#303030]">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof BottomNavigation>;

export const HomeSelected: Story = {
  args: {
    activeTab: 'home',
  },
};

export const FeedSelected: Story = {
  args: {
    activeTab: 'feed',
  },
};

export const MySelected: Story = {
  args: {
    activeTab: 'my',
  },
};
